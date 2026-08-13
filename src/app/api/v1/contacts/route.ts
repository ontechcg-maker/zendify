import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsAppClient } from '@/lib/whatsapp';
import { getOrCreateCompany } from '@/lib/company';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const state = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const tagId = searchParams.get('tagId') || '';

    const company = await getOrCreateCompany();

    const where: any = { companyId: company.id };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (state) where.state = state;
    if (city) where.city = city;
    if (tagId) {
      where.contactTags = {
        some: { tagId },
      };
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contactTags: {
          include: {
            tag: true,
          },
        },
        optOuts: true,
      },
    });

    const tags = await prisma.tag.findMany({ where: { companyId: company.id } });

    return NextResponse.json({ contacts, tags });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, email, companyName, city, state, source, consent, tagIds } = body;

    if (!firstName || !phone) {
      return NextResponse.json({ error: 'Nome e Telefone são obrigatórios' }, { status: 400 });
    }

    const company = await getOrCreateCompany();

    // Format Phone
    const formattedPhone = WhatsAppClient.formatToE164(phone);

    // Duplicate check
    const existing = await prisma.contact.findFirst({
      where: { companyId: company.id, phone: formattedPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Contato com o telefone ${formattedPhone} já está cadastrado.` },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName,
        lastName,
        phone: formattedPhone,
        whatsapp: `+${formattedPhone.slice(0, 2)} ${formattedPhone.slice(2, 4)} ${formattedPhone.slice(4)}`,
        email,
        companyName,
        city,
        state,
        source: source || 'MANUAL',
        consent: consent !== undefined ? consent : true,
        consentDate: new Date(),
        consentSource: 'PAINEL_GESTÃO',
        status: consent === false ? 'OPTED_OUT' : 'ACTIVE',
      },
    });

    // Attach tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      for (const tId of tagIds) {
        await prisma.contactTag.create({
          data: { contactId: contact.id, tagId: tId },
        });
      }
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'CREATE_CONTACT',
        resource: 'CONTACT',
        details: `Contato ${firstName} (${formattedPhone}) cadastrado com sucesso`,
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
