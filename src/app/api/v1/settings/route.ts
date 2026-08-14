import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCompany } from '@/lib/company';

export async function GET() {
  try {
    const company = await getOrCreateCompany();
    const user = await prisma.user.findFirst({
      where: { companyId: company.id },
    });

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        cnpj: company.cnpj || '',
        logoUrl: company.logoUrl || '',
        status: company.status,
      },
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, cnpj } = body;

    const company = await getOrCreateCompany();

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: name ? String(name).trim() : company.name,
        cnpj: cnpj !== undefined ? String(cnpj).trim() : company.cnpj,
      },
    });

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'UPDATE_SETTINGS',
        resource: 'COMPANY',
        details: `Configurações da empresa atualizadas: Nome="${updatedCompany.name}", CNPJ="${updatedCompany.cnpj || ''}"`,
      },
    });

    return NextResponse.json({
      success: true,
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        slug: updatedCompany.slug,
        cnpj: updatedCompany.cnpj || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
