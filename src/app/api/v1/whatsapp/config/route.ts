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
      id,
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
        data: { name: 'Minha Empresa', slug: 'minha-empresa' },
      });
    }

    // Find existing account for the company if any
    const existingAccount = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    const targetId = id || existingAccount?.id || 'default-id';

    // Check Evolution API status if selected
    let connTest: any = { connected: true, message: 'Configurações salvas com sucesso!' };
    if (provider === 'EVOLUTION' && serverUrl && apiKey) {
      try {
        const evoClient = new EvolutionClient({ serverUrl, instanceName, apiKey });
        connTest = await evoClient.getInstanceStatus();
      } catch (e: any) {
        connTest = {
          connected: false,
          state: 'close',
          message: `🔴 Não foi possível conectar ao servidor (${serverUrl}): ${e?.message || 'Erro de rede'}`,
        };
      }
    }

    const account = await prisma.whatsAppAccount.upsert({
      where: { id: targetId },
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
        id: targetId,
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
