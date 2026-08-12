import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider = 'OPENROUTER', apiKey, model, systemPrompt, temperature, userMessage, history } = body;

    const ai = new AIService({
      provider,
      apiKey,
      model,
      systemPrompt,
      temperature: temperature || 0.7,
    });

    const result = await ai.generateResponse(userMessage || 'Olá, quais são os horários de atendimento?', history || []);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
