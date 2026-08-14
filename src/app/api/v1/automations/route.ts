import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCompany } from '@/lib/company';

export async function GET() {
  try {
    const company = await getOrCreateCompany();

    const automations = await prisma.automation.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return NextResponse.json({ automations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, triggerType, steps } = body;

    if (!name || !triggerType) {
      return NextResponse.json({ error: 'Nome e Tipo de Gatilho são obrigatórios' }, { status: 400 });
    }

    const company = await getOrCreateCompany();

    const automation = await prisma.automation.create({
      data: {
        companyId: company.id,
        name,
        description,
        triggerType,
        status: 'ACTIVE',
      },
    });

    if (steps && Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await prisma.automationStep.create({
          data: {
            automationId: automation.id,
            stepOrder: i + 1,
            type: step.type || 'ACTION_SEND_MSG',
            configJson: JSON.stringify(step.config || {}),
          },
        });
      }
    }

    return NextResponse.json({ success: true, automation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

