import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AIService } from '@/lib/ai';
import { EvolutionClient } from '@/lib/evolution';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body?.event; // e.g. 'messages.upsert', 'messages.update', 'connection.update'
    const instance = body?.instance;

    console.log(`[Evolution Webhook] Received Event: ${event} for Instance: ${instance}`);

    // Handle incoming message (messages.upsert)
    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      const msgData = body?.data;
      const key = msgData?.key;
      const fromMe = key?.fromMe || false;
      const remoteJid = key?.remoteJid || '';

      // Clean phone number from remoteJid (e.g. 5511999999999@s.whatsapp.net -> +5511999999999)
      const cleanPhone = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

      const textMessage =
        msgData?.message?.conversation ||
        msgData?.message?.extendedTextMessage?.text ||
        msgData?.message?.imageMessage?.caption ||
        'Mensagem de mídia';

      if (!fromMe && formattedPhone && textMessage) {
        // Find default company
        const company = await prisma.company.findFirst();
        if (company) {
          // Find or create contact
          let contact = await prisma.contact.findFirst({
            where: { companyId: company.id, phone: formattedPhone },
          });

          if (!contact) {
            contact = await prisma.contact.create({
              data: {
                companyId: company.id,
                firstName: msgData?.pushName || 'Contato WhatsApp',
                phone: formattedPhone,
                whatsapp: formattedPhone,
                source: 'EVOLUTION_WEBHOOK',
              },
            });
          }

          // Find or create conversation
          let conversation = await prisma.conversation.findUnique({
            where: {
              companyId_contactId: {
                companyId: company.id,
                contactId: contact.id,
              },
            },
          });

          if (!conversation) {
            conversation = await prisma.conversation.create({
              data: {
                companyId: company.id,
                contactId: contact.id,
                unreadCount: 1,
                lastMessage: textMessage,
                lastMessageAt: new Date(),
                status: 'OPEN',
              },
            });
          } else {
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                unreadCount: conversation.unreadCount + 1,
                lastMessage: textMessage,
                lastMessageAt: new Date(),
                status: 'OPEN',
              },
            });
          }

          // Create Contact Inbox Message
          await prisma.inboxMessage.create({
            data: {
              conversationId: conversation.id,
              sender: 'CONTACT',
              senderName: contact.firstName,
              text: textMessage,
              wabaMessageId: key?.id || `evo_${Date.now()}`,
              status: 'DELIVERED',
            },
          });

          // Check if AI Auto-Reply is enabled
          const waAccount = await prisma.whatsAppAccount.findFirst({
            where: { companyId: company.id },
          });

          const autoReplyEnabled = waAccount?.isDefault ?? false;

          if (autoReplyEnabled) {
            console.log(`[AI Agent] Triggering Auto-Reply for ${formattedPhone}...`);

            // Initialize AI Service
            const aiService = new AIService({
              provider: 'OPENROUTER',
              apiKey: waAccount?.verifyToken || '',
              model: waAccount?.qualityRating || 'anthropic/claude-3.5-sonnet',
              systemPrompt:
                waAccount?.displayPhone ||
                'Você é o assistente virtual da empresa. Responda as dúvidas do cliente no WhatsApp.',
            });

            // Generate AI Response
            const aiResult = await aiService.generateResponse(textMessage, []);

            if (aiResult.success && aiResult.text) {
              // Send AI Response back to WhatsApp via Evolution API
              const evoClient = new EvolutionClient({
                serverUrl: waAccount?.wabaId || 'http://localhost:8080',
                instanceName: waAccount?.phoneNumberId || 'zendify_instancia_1',
                apiKey: waAccount?.accessToken || '',
              });

              await evoClient.sendTextMessage(formattedPhone, aiResult.text);

              // Record AI Bot response in Inbox
              await prisma.inboxMessage.create({
                data: {
                  conversationId: conversation.id,
                  sender: 'BOT',
                  senderName: 'Agente IA OpenRouter',
                  text: aiResult.text,
                  status: 'DELIVERED',
                },
              });

              await prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                  lastMessage: aiResult.text,
                  lastMessageAt: new Date(),
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'SUCCESS', event_processed: event });
  } catch (err: any) {
    console.error('[Evolution Webhook Error]:', err);
    return NextResponse.json({ status: 'ERROR', message: err?.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ACTIVE', provider: 'Evolution API Webhook Endpoint' });
}
