import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const company = await prisma.company.findFirst({ where: { slug: 'acme-corp' } });
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    const segments = await prisma.segment.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        campaigns: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    return NextResponse.json({ segments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, rules } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome do segmento é obrigatório' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({ where: { slug: 'acme-corp' } });
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    // Calculate initial matching contacts count
    const rulesObj = typeof rules === 'string' ? JSON.parse(rules) : rules || {};
    const where: any = { companyId: company.id, status: 'ACTIVE' };

    if (rulesObj.state) where.state = rulesObj.state;
    if (rulesObj.city) where.city = rulesObj.city;
    if (rulesObj.tagIds && Array.isArray(rulesObj.tagIds) && rulesObj.tagIds.length > 0) {
      where.contactTags = {
        some: { tagId: { in: rulesObj.tagIds } },
      };
    }

    const contactCount = await prisma.contact.count({ where });

    const segment = await prisma.segment.create({
      data: {
        companyId: company.id,
        name,
        description,
        rulesJson: JSON.stringify(rulesObj),
        contactCount,
      },
    });

    return NextResponse.json({ success: true, segment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
