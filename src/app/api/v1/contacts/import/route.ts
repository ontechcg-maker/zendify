import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsAppClient } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contacts } = body; // Array of contact objects from CSV

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'Nenhum contato fornecido para importação' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({ where: { slug: 'acme-corp' } });
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (const c of contacts) {
      const rawPhone = c.telefone || c.phone || c.whatsapp;
      const firstName = c.nome || c.firstName || c.name;

      if (!rawPhone || !firstName) {
        invalidCount++;
        continue;
      }

      const formattedPhone = WhatsAppClient.formatToE164(String(rawPhone));

      // Check duplicates
      const existing = await prisma.contact.findFirst({
        where: { companyId: company.id, phone: formattedPhone },
      });

      if (existing) {
        duplicateCount++;
        continue;
      }

      await prisma.contact.create({
        data: {
          companyId: company.id,
          firstName: String(firstName),
          lastName: c.sobrenome || c.lastName || '',
          phone: formattedPhone,
          whatsapp: `+${formattedPhone}`,
          email: c.email || c.emailAddress || '',
          companyName: c.empresa || c.companyName || '',
          city: c.cidade || c.city || '',
          state: c.estado || c.state || '',
          source: 'CSV',
          consent: true,
          consentSource: 'IMPORTACAO_CSV',
          status: 'ACTIVE',
        },
      });

      importedCount++;
    }

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'IMPORT_CONTACTS',
        resource: 'CSV_IMPORT',
        details: `Importação CSV concluída: ${importedCount} importados, ${duplicateCount} duplicados, ${invalidCount} inválidos.`,
      },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      duplicateCount,
      invalidCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
