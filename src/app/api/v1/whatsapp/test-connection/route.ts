import { NextRequest, NextResponse } from 'next/server';
import { EvolutionClient } from '@/lib/evolution';
import { WhatsAppClient } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { provider = 'EVOLUTION', serverUrl, instanceName, apiKey, phoneNumberId, accessToken } = body;

    if (provider === 'EVOLUTION') {
      const evoClient = new EvolutionClient({ serverUrl, instanceName, apiKey });
      const result = await evoClient.getInstanceStatus();
      return NextResponse.json({ success: true, result });
    } else {
      const client = new WhatsAppClient(phoneNumberId, accessToken);
      const result = await client.testConnection();
      return NextResponse.json({ success: true, result });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
