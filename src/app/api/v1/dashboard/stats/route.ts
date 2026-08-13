import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch first available company or fallback
    let company = await prisma.company.findFirst();

    if (!company) {
      return NextResponse.json({
        company: { name: 'Sua Empresa', slug: 'minha-empresa' },
        stats: {
          totalContacts: 0,
          activeContacts: 0,
          inactiveContacts: 0,
          totalCampaigns: 0,
          scheduledCampaignsCount: 0,
          messagesSent: 0,
          messagesDelivered: 0,
          messagesRead: 0,
          messagesReplied: 0,
          messagesFailed: 0,
          deliveryRate: '0.0%',
          readRate: '0.0%',
          responseRate: '0.0%',
        },
        recentCampaigns: [],
        performanceChart: [],
      });
    }

    const companyId = company.id;

    // 1. Contact Metrics
    const totalContacts = await prisma.contact.count({ where: { companyId } });
    const activeContacts = await prisma.contact.count({
      where: { companyId, status: 'ACTIVE' },
    });
    const inactiveContacts = await prisma.contact.count({
      where: { companyId, status: { in: ['INACTIVE', 'BLOCKED', 'OPTED_OUT'] } },
    });

    // 2. Campaign Metrics
    const totalCampaigns = await prisma.campaign.count({ where: { companyId } });
    const scheduledCampaignsCount = await prisma.campaign.count({
      where: { companyId, status: 'SCHEDULED' },
    });

    // Aggregate Message Counts across campaigns
    const campaignAggregates = await prisma.campaign.aggregate({
      where: { companyId },
      _sum: {
        totalRecipients: true,
        sentCount: true,
        deliveredCount: true,
        readCount: true,
        repliedCount: true,
        failedCount: true,
      },
    });

    const messagesSent = campaignAggregates._sum.sentCount || 0;
    const messagesDelivered = campaignAggregates._sum.deliveredCount || 0;
    const messagesRead = campaignAggregates._sum.readCount || 0;
    const messagesReplied = campaignAggregates._sum.repliedCount || 0;
    const messagesFailed = campaignAggregates._sum.failedCount || 0;

    // Rates calculation
    const deliveryRate = messagesSent > 0 ? ((messagesDelivered / messagesSent) * 100).toFixed(1) : '0.0';
    const readRate = messagesDelivered > 0 ? ((messagesRead / messagesDelivered) * 100).toFixed(1) : '0.0';
    const responseRate = messagesRead > 0 ? ((messagesReplied / messagesRead) * 100).toFixed(1) : '0.0';

    // Recent Campaigns
    const recentCampaigns = await prisma.campaign.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        segment: true,
        template: true,
      },
    });

    // Performance Chart Data - empty default or real zero days
    const performanceChart = [
      { day: 'Seg', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
      { day: 'Ter', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
      { day: 'Qua', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
      { day: 'Qui', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
      { day: 'Sex', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
      { day: 'Sáb', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
      { day: 'Dom', enviadas: 0, entregues: 0, lidas: 0, respostas: 0 },
    ];

    return NextResponse.json({
      company: { name: company.name, slug: company.slug },
      stats: {
        totalContacts,
        activeContacts,
        inactiveContacts,
        totalCampaigns,
        scheduledCampaignsCount,
        messagesSent,
        messagesDelivered,
        messagesRead,
        messagesReplied,
        messagesFailed,
        deliveryRate: `${deliveryRate}%`,
        readRate: `${readRate}%`,
        responseRate: `${responseRate}%`,
      },
      recentCampaigns,
      performanceChart,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
