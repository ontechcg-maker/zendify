import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsAppClient } from '@/lib/whatsapp';
import { getOrCreateCompany } from '@/lib/company';

export async function GET(req: NextRequest) {
  try {
    const company = await getOrCreateCompany();

    const conversations = await prisma.conversation.findMany({
      where: { companyId: company.id },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        contact: true,
        inboxMessages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, text } = body;

    if (!conversationId || !text) {
      return NextResponse.json({ error: 'ID da conversa e texto são obrigatórios' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    const waAccount = await prisma.whatsAppAccount.findFirst({
      where: { companyId: conversation.companyId },
    });

    const waClient = new WhatsAppClient(waAccount?.phoneNumberId, waAccount?.accessToken);

    // Send reply via WhatsApp API
    const dispatchResult = await waClient.sendTextMessage(conversation.contact.phone, text);

    // Save message to Inbox
    const inboxMessage = await prisma.inboxMessage.create({
      data: {
        conversationId,
        sender: 'OPERATOR',
        senderName: 'Atendente Carlos',
        text,
        wabaMessageId: dispatchResult.wabaMessageId || null,
        status: dispatchResult.success ? 'SENT' : 'FAILED',
      },
    });

    // Update conversation metadata
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageAt: new Date(),
        unreadCount: 0,
      },
    });

    return NextResponse.json({ success: true, inboxMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
