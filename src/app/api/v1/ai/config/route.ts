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

    const account = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    let aiConfig = {
      provider: 'GEMINI',
      apiKey: '',
      model: 'gemini-2.0-flash',
      systemPrompt:
        'Você é o atendente virtual inteligente da empresa. Responda com simpatia, clareza e agilidade no WhatsApp.',
      temperature: 0.7,
      autoReplyEnabled: false,
    };

    if (account?.verifyToken) {
      try {
        const parsed = JSON.parse(account.verifyToken);
        if (parsed && typeof parsed === 'object') {
          aiConfig = { ...aiConfig, ...parsed };
        }
      } catch (e) {
        // Fallback for legacy plain text API keys
        const rawKey = account.verifyToken;
        aiConfig.apiKey = rawKey;
        if (account.qualityRating) aiConfig.model = account.qualityRating;
        if (account.displayPhone) aiConfig.systemPrompt = account.displayPhone;
        if (account.isDefault !== undefined) aiConfig.autoReplyEnabled = account.isDefault;

        if (rawKey.startsWith('AIza')) {
          aiConfig.provider = 'GEMINI';
        } else if (rawKey.startsWith('sk-or')) {
          aiConfig.provider = 'OPENROUTER';
        } else if (rawKey.startsWith('sk-')) {
          aiConfig.provider = 'OPENAI';
        }
      }
    }

    return NextResponse.json({ config: aiConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      provider = 'GEMINI',
      apiKey = '',
      model = 'gemini-2.0-flash',
      systemPrompt = 'Você é o atendente virtual inteligente da empresa. Responda com simpatia, clareza e agilidade no WhatsApp.',
      temperature = 0.7,
      autoReplyEnabled = false,
    } = body;

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Minha Empresa', slug: 'minha-empresa' },
      });
    }

    let account = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    const aiConfigObj = {
      provider,
      apiKey: apiKey ? String(apiKey).trim() : '',
      model,
      systemPrompt,
      temperature,
      autoReplyEnabled,
    };

    const serializedConfig = JSON.stringify(aiConfigObj);

    if (account) {
      await prisma.whatsAppAccount.update({
        where: { id: account.id },
        data: {
          verifyToken: serializedConfig,
          qualityRating: model,
          displayPhone: systemPrompt,
          isDefault: autoReplyEnabled,
        },
      });
    } else {
      account = await prisma.whatsAppAccount.create({
        data: {
          companyId: company.id,
          name: 'Zendify WhatsApp Account',
          verifyToken: serializedConfig,
          qualityRating: model,
          displayPhone: systemPrompt,
          isDefault: autoReplyEnabled,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: aiConfigObj,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
