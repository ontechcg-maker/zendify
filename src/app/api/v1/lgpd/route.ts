import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCompany } from '@/lib/company';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');

    const company = await getOrCreateCompany();


    const optOuts = await prisma.optOut.findMany({
      where: { companyId: company.id },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: true },
    });

    if (contactId) {
      const contactData = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          contactTags: { include: { tag: true } },
          messages: true,
          optOuts: true,
          conversations: { include: { inboxMessages: true } },
        },
      });
      return NextResponse.json({ contactData, optOuts, auditLogs });
    }

    return NextResponse.json({ optOuts, auditLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contactId, action, reason } = body; // action: 'OPT_OUT' | 'ERASE_DATA'

    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) return NextResponse.json({ error: 'Contato não encontrado' }, { status: 404 });

    if (action === 'OPT_OUT') {
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'OPTED_OUT', consent: false },
      });

      await prisma.optOut.create({
        data: {
          companyId: contact.companyId,
          contactId: contact.id,
          phone: contact.phone,
          reason: reason || 'Opt-out solicitado pelo painel LGPD',
          source: 'MANUAL',
        },
      });

      await prisma.auditLog.create({
        data: {
          companyId: contact.companyId,
          action: 'REGISTER_OPT_OUT',
          resource: 'LGPD_COMPLIANCE',
          details: `Opt-out manual registrado para o contato ${contact.phone} (${contact.firstName})`,
        },
      });

      return NextResponse.json({ success: true, message: 'Opt-out registrado com sucesso' });
    }

    if (action === 'ERASE_DATA') {
      // LGPD Right to Erasure
      await prisma.auditLog.create({
        data: {
          companyId: contact.companyId,
          action: 'LGPD_ERASURE',
          resource: 'CONTACT',
          details: `Exclusão total de dados do contato ID: ${contactId} (${contact.phone}) em conformidade com a LGPD`,
        },
      });

      await prisma.contact.delete({ where: { id: contactId } });
      return NextResponse.json({ success: true, message: 'Dados do contato excluídos permanentemente' });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
