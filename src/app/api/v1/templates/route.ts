import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const company = await prisma.company.findFirst({ where: { slug: 'acme-corp' } });
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    const templates = await prisma.template.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, language, headerType, headerMedia, bodyText, footerText, buttons, variables } = body;

    if (!name || !bodyText) {
      return NextResponse.json({ error: 'Nome e texto principal do template são obrigatórios' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({ where: { slug: 'acme-corp' } });
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    const formattedName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const template = await prisma.template.create({
      data: {
        companyId: company.id,
        name: formattedName,
        category: category || 'MARKETING',
        language: language || 'pt_BR',
        status: 'APPROVED', // Pre-approved in WABA environment
        headerType: headerType || 'NONE',
        headerMedia: headerMedia || null,
        bodyText,
        footerText: footerText || null,
        buttonsJson: buttons ? JSON.stringify(buttons) : null,
        variables: variables || '{{nome}},{{empresa}},{{cidade}}',
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
