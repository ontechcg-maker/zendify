import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Meta Webhook Verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify against configured secret token
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'zendify_verify_secret_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Meta Webhook verificado com sucesso!');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Verification failed', { status: 403 });
}

// Meta Event Processor (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: 'ignored' });
    }

    const company = await prisma.company.findFirst({ where: { slug: 'acme-corp' } });
    if (!company) return NextResponse.json({ status: 'company_not_found' });

    // 1. Process Status Updates (sent, delivered, read, failed)
    if (value.statuses && Array.isArray(value.statuses)) {
      for (const statusObj of value.statuses) {
        const wabaMessageId = statusObj.id;
        const statusStr = statusObj.status?.toUpperCase(); // SENT, DELIVERED, READ, FAILED

        const message = await prisma.message.findFirst({
          where: { wabaMessageId },
        });

        if (message) {
          const updateData: any = { status: statusStr };
          if (statusStr === 'DELIVERED') updateData.deliveredAt = new Date();
          if (statusStr === 'READ') updateData.readAt = new Date();

          await prisma.message.update({
            where: { id: message.id },
            data: updateData,
          });

          await prisma.messageEvent.create({
            data: {
              messageId: message.id,
              event: statusStr,
              details: `Atualização de status via Webhook WABA: ${statusStr}`,
            },
          });

          // Update Campaign Counters
          if (message.campaignId) {
            if (statusStr === 'DELIVERED') {
              await prisma.campaign.update({
                where: { id: message.campaignId },
                data: { deliveredCount: { increment: 1 } },
              });
            } else if (statusStr === 'READ') {
              await prisma.campaign.update({
                where: { id: message.campaignId },
                data: { readCount: { increment: 1 } },
              });
            }
          }
        }
      }
    }

    // 2. Process Incoming Messages from Customers (Inbox & Automations)
    if (value.messages && Array.isArray(value.messages)) {
      for (const msgObj of value.messages) {
        const fromPhone = msgObj.from; // Customer phone E.164
        const textBody = msgObj.text?.body || msgObj.caption || '[Mídia recebida]';

        // Find or create Contact
        let contact = await prisma.contact.findFirst({
          where: { companyId: company.id, phone: { contains: fromPhone } },
        });

        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              companyId: company.id,
              firstName: value.contacts?.[0]?.profile?.name || `Contato ${fromPhone.slice(-4)}`,
              phone: fromPhone,
              whatsapp: `+${fromPhone}`,
              source: 'WEBHOOK',
              consent: true,
              status: 'ACTIVE',
            },
          });
        }

        // Check if message is an Opt-Out Keyword ("PARAR", "CANCELAR", "SAIR")
        const upperText = textBody.trim().toUpperCase();
        if (['PARAR', 'CANCELAR', 'SAIR', 'STOP', 'OPT OUT', 'UNSUBSCRIBE'].includes(upperText)) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: { status: 'OPTED_OUT', consent: false },
          });

          await prisma.optOut.create({
            data: {
              companyId: company.id,
              contactId: contact.id,
              phone: contact.phone,
              reason: `Recebida palavra-chave: ${upperText}`,
              source: 'WHATSAPP_STOP',
            },
          });

          console.log(`🛑 Opt-out registrado via Webhook para o contato ${contact.phone}`);
        }

        // Upsert Conversation in Inbox
        const conversation = await prisma.conversation.upsert({
          where: {
            companyId_contactId: {
              companyId: company.id,
              contactId: contact.id,
            },
          },
          update: {
            lastMessage: textBody,
            lastMessageAt: new Date(),
            unreadCount: { increment: 1 },
          },
          create: {
            companyId: company.id,
            contactId: contact.id,
            lastMessage: textBody,
            lastMessageAt: new Date(),
            unreadCount: 1,
            status: 'OPEN',
          },
        });

        // Insert Inbox Message
        await prisma.inboxMessage.create({
          data: {
            conversationId: conversation.id,
            sender: 'CONTACT',
            senderName: contact.firstName,
            text: textBody,
            wabaMessageId: msgObj.id,
            status: 'DELIVERED',
          },
        });
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
