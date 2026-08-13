import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Minha Empresa', slug: 'minha-empresa' },
      });
    }

    // Fetch account or default config
    const account = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    // Parse stored AI settings from json or fallback
    return NextResponse.json({
      config: {
        provider: 'OPENROUTER',
        apiKey: account?.verifyToken?.startsWith('sk-or-') ? account.verifyToken : '',
        model: account?.qualityRating || 'anthropic/claude-3.5-sonnet',
        systemPrompt:
          account?.displayPhone ||
          'Você é o atendente virtual inteligente da empresa. Responda com simpatia, clareza e agilidade no WhatsApp.',
        temperature: 0.7,
        autoReplyEnabled: account?.isDefault || false,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider = 'OPENROUTER', apiKey, model, systemPrompt, temperature, autoReplyEnabled } = body;

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Acme Corp', slug: 'acme-corp' },
      });
    }

    const account = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    if (account) {
      await prisma.whatsAppAccount.update({
        where: { id: account.id },
        data: {
          verifyToken: apiKey, // Store AI API Key in verifyToken field or flexible store
          qualityRating: model, // Store selected model
          displayPhone: systemPrompt, // Store system prompt
          isDefault: autoReplyEnabled, // Store AutoReply enabled state
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: { provider, apiKey, model, systemPrompt, temperature, autoReplyEnabled },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
