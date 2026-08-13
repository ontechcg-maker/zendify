import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EvolutionClient } from '@/lib/evolution';

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });

    const account = await prisma.whatsAppAccount.findFirst({ where: { companyId: company.id } });
    if (!account) return NextResponse.json({ groups: [] });

    // Build Evolution client from saved config
    const serverUrl = account.wabaId || '';
    const instanceName = account.phoneNumberId || 'zendify';
    const apiKey = account.accessToken || '';

    const evoClient = new EvolutionClient({ serverUrl, instanceName, apiKey });
    const groups = await evoClient.fetchGroups();

    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
