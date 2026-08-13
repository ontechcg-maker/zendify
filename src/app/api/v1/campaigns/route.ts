import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CampaignQueueProcessor } from '@/lib/queue';

export async function GET() {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Minha Empresa', slug: 'minha-empresa' },
      });
    }

    const campaigns = await prisma.campaign.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' },
      include: {
        segment: true,
        template: true,
        whatsappAccount: true,
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      segmentId,
      templateId,
      messageText,
      mediaType,
      mediaUrl,
      buttonsJson,
      scheduledFor,
      sendNow,
      batchRatePerMin,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome da campanha é obrigatório' }, { status: 400 });
    }

    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: { name: 'Acme Corp', slug: 'acme-corp' },
      });
    }

    const waAccount = await prisma.whatsAppAccount.findFirst({
      where: { companyId: company.id },
    });

    // Determine target contacts
    let contactsToRecieve = [];
    if (segmentId) {
      const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
      const rules = segment?.rulesJson ? JSON.parse(segment.rulesJson) : {};
      const where: any = { companyId: company.id, status: 'ACTIVE' };

      if (rules.state) where.state = rules.state;
      if (rules.city) where.city = rules.city;
      if (rules.tagIds && rules.tagIds.length > 0) {
        where.contactTags = { some: { tagId: { in: rules.tagIds } } };
      }

      contactsToRecieve = await prisma.contact.findMany({ where });
    } else {
      contactsToRecieve = await prisma.contact.findMany({
        where: { companyId: company.id, status: 'ACTIVE' },
      });
    }

    const campaignStatus = sendNow ? 'PROCESSING' : scheduledFor ? 'SCHEDULED' : 'DRAFT';

    const campaign = await prisma.campaign.create({
      data: {
        companyId: company.id,
        whatsappAccountId: waAccount?.id || null,
        segmentId: segmentId || null,
        templateId: templateId || null,
        name,
        status: campaignStatus,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        messageText: messageText || 'Olá, {{nome}}!',
        mediaType: mediaType || 'NONE',
        mediaUrl: mediaUrl || null,
        buttonsJson: buttonsJson || null,
        totalRecipients: contactsToRecieve.length,
        batchRatePerMin: batchRatePerMin || 60,
      },
    });

    // Populate Recipients
    for (const c of contactsToRecieve) {
      await prisma.campaignRecipient.create({
        data: {
          campaignId: campaign.id,
          contactId: c.id,
          status: 'PENDING',
        },
      });
    }

    // If immediate send is requested, trigger queue processor right away!
    if (sendNow) {
      await CampaignQueueProcessor.processNextBatch(campaign.id);
    }

    await prisma.auditLog.create({
      data: {
        companyId: company.id,
        action: 'CREATE_CAMPAIGN',
        resource: 'CAMPAIGN',
        details: `Campanha "${name}" criada com ${contactsToRecieve.length} destinatários. Status: ${campaignStatus}`,
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
