import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EvolutionClient } from '@/lib/evolution';

export async function GET() {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Minha Empresa', slug: 'minha-empresa' },
      });
    }

    const account = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      provider = 'EVOLUTION',
      serverUrl,
      instanceName,
      apiKey,
      wabaId,
      phoneNumberId,
      accessToken,
      webhookUrl,
      verifyToken,
    } = body;

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Acme Corp', slug: 'acme-corp' },
      });
    }

    // Check Evolution API status if selected
    let connTest: any = { connected: true, message: 'Configurações salvas' };
    if (provider === 'EVOLUTION') {
      const evoClient = new EvolutionClient({ serverUrl, instanceName, apiKey });
      connTest = await evoClient.getInstanceStatus();
    }

    const account = await prisma.whatsAppAccount.upsert({
      where: { id: body.id || 'default-id' },
      update: {
        name: provider === 'EVOLUTION' ? `Evolution (${instanceName})` : 'WABA Meta Oficial',
        wabaId: provider === 'EVOLUTION' ? serverUrl : wabaId,
        phoneNumberId: provider === 'EVOLUTION' ? instanceName : phoneNumberId,
        accessToken: provider === 'EVOLUTION' ? apiKey : accessToken,
        webhookUrl,
        verifyToken,
        status: connTest.connected ? 'CONNECTED' : 'DISCONNECTED',
      },
      create: {
        id: 'default-id',
        companyId: company.id,
        name: provider === 'EVOLUTION' ? `Evolution (${instanceName})` : 'WABA Meta Oficial',
        wabaId: provider === 'EVOLUTION' ? serverUrl : wabaId,
        phoneNumberId: provider === 'EVOLUTION' ? instanceName : phoneNumberId,
        accessToken: provider === 'EVOLUTION' ? apiKey : accessToken,
        webhookUrl,
        verifyToken,
        status: connTest.connected ? 'CONNECTED' : 'DISCONNECTED',
      },
    });

    return NextResponse.json({ success: true, account, connTest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
