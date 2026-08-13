import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EvolutionClient } from '@/lib/evolution';
import { WhatsAppClient } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, groupName, createSegment } = body;

    if (!groupId) return NextResponse.json({ error: 'groupId é obrigatório' }, { status: 400 });

    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    const account = await prisma.whatsAppAccount.findFirst({ where: { companyId: company.id } });
    if (!account) return NextResponse.json({ error: 'Conta WhatsApp não configurada' }, { status: 400 });

    const serverUrl = account.wabaId || '';
    const instanceName = account.phoneNumberId || 'zendify';
    const apiKey = account.accessToken || '';

    const evoClient = new EvolutionClient({ serverUrl, instanceName, apiKey });
    const participants = await evoClient.fetchGroupParticipants(groupId);

    if (!participants.length) {
      return NextResponse.json({ error: 'Nenhum participante encontrado ou grupo inválido' }, { status: 404 });
    }

    // Create or find a Tag for the group (for segment filtering)
    let groupTag = await prisma.tag.findFirst({
      where: { companyId: company.id, name: `Grupo: ${groupName}` },
    });
    if (!groupTag) {
      groupTag = await prisma.tag.create({
        data: {
          companyId: company.id,
          name: `Grupo: ${groupName}`,
          color: '#10B981', // emerald
        },
      });
    }

    // Import contacts
    const results = { created: 0, updated: 0, skipped: 0 };

    for (const p of participants) {
      if (!p.phone || p.phone.length < 8) { results.skipped++; continue; }

      const phone = WhatsAppClient.formatToE164(p.phone);
      if (!phone || phone.length < 10) { results.skipped++; continue; }

      const nameParts = (p.pushName || 'Contato').trim().split(' ');
      const firstName = nameParts[0] || 'Contato';
      const lastName = nameParts.slice(1).join(' ') || '';

      let contact = await prisma.contact.findFirst({ where: { companyId: company.id, phone } });

      if (!contact) {
        contact = await prisma.contact.create({
          data: {
            companyId: company.id,
            firstName,
            lastName,
            phone,
            whatsapp: `+${phone.slice(0, 2)} ${phone.slice(2, 4)} ${phone.slice(4)}`,
            source: 'WHATSAPP_GROUP',
            consent: true,
            consentDate: new Date(),
            consentSource: 'GRUPO_WHATSAPP',
            status: 'ACTIVE',
          },
        });
        results.created++;
      } else {
        results.updated++;
      }

      // Attach group tag if not already
      const hasTag = await prisma.contactTag.findFirst({
        where: { contactId: contact.id, tagId: groupTag.id },
      });
      if (!hasTag) {
        await prisma.contactTag.create({
          data: { contactId: contact.id, tagId: groupTag.id },
        });
      }
    }

    // Create Segment that filters by this group's tag
    let segment = null;
    if (createSegment) {
      const segmentName = `Grupo: ${groupName}`;
      const rulesJson = JSON.stringify({ tagId: groupTag.id, tagName: groupTag.name });

      const existingSegment = await prisma.segment.findFirst({
        where: { companyId: company.id, name: segmentName },
      });

      if (existingSegment) {
        segment = await prisma.segment.update({
          where: { id: existingSegment.id },
          data: {
            contactCount: results.created + results.updated,
            updatedAt: new Date(),
          },
        });
      } else {
        segment = await prisma.segment.create({
          data: {
            companyId: company.id,
            name: segmentName,
            description: `Importado do grupo do WhatsApp: ${groupName}`,
            rulesJson,
            contactCount: results.created + results.updated,
          },
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'IMPORT_GROUP',
        resource: 'CONTACT',
        details: `Grupo "${groupName}": ${results.created} criados, ${results.updated} atualizados, ${results.skipped} ignorados`,
      },
    });

    return NextResponse.json({
      success: true,
      results,
      totalImported: results.created + results.updated,
      tag: groupTag,
      segment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
