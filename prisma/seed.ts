import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Zendify database seed...');

  // 1. Create Plans
  const freePlan = await prisma.plan.upsert({
    where: { code: 'FREE' },
    update: {},
    create: {
      name: 'FREE',
      code: 'FREE',
      priceMonthly: 0,
      maxUsers: 1,
      maxContacts: 100,
      maxCampaignsMonth: 3,
      maxMessagesMonth: 500,
      allowAutomations: false,
      allowApi: false,
    },
  });

  const starterPlan = await prisma.plan.upsert({
    where: { code: 'STARTER' },
    update: {},
    create: {
      name: 'STARTER',
      code: 'STARTER',
      priceMonthly: 149,
      maxUsers: 3,
      maxContacts: 1000,
      maxCampaignsMonth: 15,
      maxMessagesMonth: 5000,
      allowAutomations: true,
      allowApi: false,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { code: 'PRO' },
    update: {},
    create: {
      name: 'PRO',
      code: 'PRO',
      priceMonthly: 399,
      maxUsers: 10,
      maxContacts: 10000,
      maxCampaignsMonth: 50,
      maxMessagesMonth: 50000,
      allowAutomations: true,
      allowApi: true,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { code: 'ENTERPRISE' },
    update: {},
    create: {
      name: 'ENTERPRISE',
      code: 'ENTERPRISE',
      priceMonthly: 899,
      maxUsers: 50,
      maxContacts: 100000,
      maxCampaignsMonth: 999,
      maxMessagesMonth: 500000,
      allowAutomations: true,
      allowApi: true,
    },
  });

  // 2. Create Company
  const company = await prisma.company.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp Brasil',
      slug: 'acme-corp',
      cnpj: '12.345.678/0001-90',
      status: 'ACTIVE',
      planId: proPlan.id,
    },
  });

  // Create Subscription
  await prisma.subscription.create({
    data: {
      companyId: company.id,
      planId: proPlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Create Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@zendify.io' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Carlos Oliveira',
      email: 'admin@zendify.io',
      passwordHash: 'admin123', // Demo password
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: 'operador@zendify.io' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Mariana Souza',
      email: 'operador@zendify.io',
      passwordHash: 'operador123',
      role: 'OPERATOR',
      status: 'ACTIVE',
    },
  });

  // 4. Create WhatsApp Account
  const waAccount = await prisma.whatsAppAccount.create({
    data: {
      companyId: company.id,
      name: 'Suporte Oficial WABA',
      wabaId: '109823749817234',
      phoneNumberId: '102938475610293',
      accessToken: 'EAAG...ZendifyOfficialTokenDemo',
      displayPhone: '+55 11 98765-4321',
      qualityRating: 'GREEN',
      status: 'CONNECTED',
      webhookUrl: 'https://zendify.app/api/webhooks/whatsapp',
      verifyToken: 'zendify_verify_secret_2026',
      isDefault: true,
    },
  });

  // 5. Create Webhook entry
  await prisma.webhook.create({
    data: {
      companyId: company.id,
      whatsappAccountId: waAccount.id,
      name: 'Webhook Eventos Meta Cloud API',
      url: 'https://zendify.app/api/webhooks/whatsapp',
      eventsJson: JSON.stringify(['messages', 'message_deliveries', 'message_reads', 'message_failures']),
      active: true,
    },
  });

  // 6. Create Tags
  const tagVip = await prisma.tag.create({
    data: { companyId: company.id, name: 'VIP', color: '#10B981' },
  });
  const tagLead = await prisma.tag.create({
    data: { companyId: company.id, name: 'Lead Quente', color: '#F59E0B' },
  });
  const tagInativo = await prisma.tag.create({
    data: { companyId: company.id, name: 'Inativo', color: '#6B7280' },
  });
  const tagPromo = await prisma.tag.create({
    data: { companyId: company.id, name: 'Promoção', color: '#8B5CF6' },
  });

  // 7. Create Contacts
  const contactsData = [
    {
      firstName: 'Ana',
      lastName: 'Pereira',
      phone: '+5511998877661',
      whatsapp: '+55 11 99887-7661',
      email: 'ana.pereira@empresa.com.br',
      companyName: 'Tech Solutions',
      city: 'São Paulo',
      state: 'SP',
      source: 'CSV',
      consent: true,
      tags: [tagVip.id, tagPromo.id],
    },
    {
      firstName: 'Lucas',
      lastName: 'Mendes',
      phone: '+5521987654321',
      whatsapp: '+55 21 98765-4321',
      email: 'lucas.mendes@designstudio.io',
      companyName: 'Studio Design',
      city: 'Rio de Janeiro',
      state: 'RJ',
      source: 'MANUAL',
      consent: true,
      tags: [tagLead.id],
    },
    {
      firstName: 'Fernanda',
      lastName: 'Costa',
      phone: '+5531991234567',
      whatsapp: '+55 31 99123-4567',
      email: 'fernanda.costa@logistica.com',
      companyName: 'Express Log',
      city: 'Belo Horizonte',
      state: 'MG',
      source: 'API',
      consent: true,
      tags: [tagVip.id],
    },
    {
      firstName: 'Roberto',
      lastName: 'Alves',
      phone: '+5541999881122',
      whatsapp: '+55 41 99988-1122',
      email: 'roberto.alves@comercio.com',
      companyName: 'Comércio Global',
      city: 'Curitiba',
      state: 'PR',
      source: 'CSV',
      consent: true,
      tags: [tagInativo.id],
    },
    {
      firstName: 'Juliana',
      lastName: 'Santos',
      phone: '+5551988776655',
      whatsapp: '+55 51 98877-6655',
      email: 'juliana.santos@consultoria.com',
      companyName: 'JS Consultoria',
      city: 'Porto Alegre',
      state: 'RS',
      source: 'MANUAL',
      consent: true,
      tags: [tagLead.id, tagPromo.id],
    },
    {
      firstName: 'Marcelo',
      lastName: 'Ferreira',
      phone: '+5519971122334',
      whatsapp: '+55 19 97112-2334',
      email: 'marcelo.ferreira@agro.com.br',
      companyName: 'AgroTech',
      city: 'Campinas',
      state: 'SP',
      source: 'CSV',
      consent: false,
      status: 'OPTED_OUT',
      tags: [tagInativo.id],
    },
  ];

  const createdContacts = [];
  for (const cData of contactsData) {
    const contact = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: cData.firstName,
        lastName: cData.lastName,
        phone: cData.phone,
        whatsapp: cData.whatsapp,
        email: cData.email,
        companyName: cData.companyName,
        city: cData.city,
        state: cData.state,
        source: cData.source,
        consent: cData.consent,
        status: cData.status || 'ACTIVE',
        lastInteractionAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)),
      },
    });

    for (const tagId of cData.tags) {
      await prisma.contactTag.create({
        data: { contactId: contact.id, tagId },
      });
    }

    if (!cData.consent) {
      await prisma.optOut.create({
        data: {
          companyId: company.id,
          contactId: contact.id,
          phone: cData.phone,
          reason: 'Solicitou parada via WhatsApp',
          source: 'WHATSAPP_STOP',
        },
      });
    }

    createdContacts.push(contact);
  }

  // 8. Create Segments
  const segVip = await prisma.segment.create({
    data: {
      companyId: company.id,
      name: 'Clientes VIP',
      description: 'Contatos com a tag VIP e consentimento ativo',
      rulesJson: JSON.stringify({ tagIds: [tagVip.id], status: 'ACTIVE' }),
      contactCount: 2,
    },
  });

  const segLeads = await prisma.segment.create({
    data: {
      companyId: company.id,
      name: 'Leads Quentes',
      description: 'Leads interessados cadastrados recentemente',
      rulesJson: JSON.stringify({ tagIds: [tagLead.id], status: 'ACTIVE' }),
      contactCount: 2,
    },
  });

  const segSP = await prisma.segment.create({
    data: {
      companyId: company.id,
      name: 'Contatos de São Paulo',
      description: 'Filtrados pelo estado SP',
      rulesJson: JSON.stringify({ state: 'SP', status: 'ACTIVE' }),
      contactCount: 2,
    },
  });

  // 9. Create Templates
  const templatePromo = await prisma.template.create({
    data: {
      companyId: company.id,
      name: 'oferta_especial_v2',
      language: 'pt_BR',
      category: 'PROMOTION',
      status: 'APPROVED',
      headerType: 'TEXT',
      bodyText: 'Olá, {{nome}}! Temos uma oferta especial da empresa {{empresa}} para a cidade de {{cidade}}. Aproveite 20% de desconto usando o cupom ZENDIFY20.',
      footerText: 'Responda PARAR para cancelar o recebimento.',
      buttonsJson: JSON.stringify([
        { type: 'QUICK_REPLY', text: 'Quero Aproveitar' },
        { type: 'QUICK_REPLY', text: 'Falar com Atendente' },
      ]),
      variables: '{{nome}},{{empresa}},{{cidade}}',
    },
  });

  const templateInformativo = await prisma.template.create({
    data: {
      companyId: company.id,
      name: 'comunicado_importante',
      language: 'pt_BR',
      category: 'INFORMATIVE',
      status: 'APPROVED',
      headerType: 'NONE',
      bodyText: 'Prezado(a) {{nome}}, informamos que o seu cadastro na {{empresa}} foi atualizado com sucesso!',
      footerText: 'Zendify - Plataforma Oficial WhatsApp',
      variables: '{{nome}},{{empresa}}',
    },
  });

  // 10. Create Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      companyId: company.id,
      whatsappAccountId: waAccount.id,
      segmentId: segVip.id,
      templateId: templatePromo.id,
      name: 'Campanha de Lançamento VIP',
      status: 'COMPLETED',
      totalRecipients: 5,
      sentCount: 5,
      deliveredCount: 5,
      readCount: 4,
      repliedCount: 2,
      failedCount: 0,
      messageText: 'Olá, {{nome}}! Temos uma oferta especial da empresa {{empresa}} para a cidade de {{cidade}}.',
      batchRatePerMin: 60,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      companyId: company.id,
      whatsappAccountId: waAccount.id,
      segmentId: segLeads.id,
      templateId: templateInformativo.id,
      name: 'Reengajamento de Leads Q3',
      status: 'SCHEDULED',
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      totalRecipients: 3,
      messageText: 'Prezado(a) {{nome}}, informamos que o seu cadastro na {{empresa}} foi atualizado!',
      batchRatePerMin: 60,
    },
  });

  // 11. Create Campaign Recipients and Messages for Campaign 1
  for (let i = 0; i < 5; i++) {
    const contact = createdContacts[i % createdContacts.length];
    if (contact.status === 'OPTED_OUT') continue;

    await prisma.campaignRecipient.create({
      data: {
        campaignId: campaign1.id,
        contactId: contact.id,
        status: 'READ',
        sentAt: new Date(Date.now() - 3600 * 1000),
        deliveredAt: new Date(Date.now() - 3500 * 1000),
        readAt: new Date(Date.now() - 3000 * 1000),
      },
    });

    const msg = await prisma.message.create({
      data: {
        companyId: company.id,
        campaignId: campaign1.id,
        contactId: contact.id,
        direction: 'OUTBOUND',
        wabaMessageId: `wamid.HBgL${Math.random().toString(36).substring(7)}`,
        type: 'TEMPLATE',
        content: `Olá, ${contact.firstName}! Temos uma oferta especial da empresa ${contact.companyName || 'Sua Empresa'} para a cidade de ${contact.city || 'sua região'}.`,
        status: 'READ',
        sentAt: new Date(Date.now() - 3600 * 1000),
        deliveredAt: new Date(Date.now() - 3500 * 1000),
        readAt: new Date(Date.now() - 3000 * 1000),
      },
    });

    await prisma.messageEvent.create({
      data: { messageId: msg.id, event: 'SENT', details: 'Mensagem entregue à Meta Graph API' },
    });
    await prisma.messageEvent.create({
      data: { messageId: msg.id, event: 'DELIVERED', details: 'Confirmação de entrega do dispositivo' },
    });
    await prisma.messageEvent.create({
      data: { messageId: msg.id, event: 'READ', details: 'Confirmação de leitura por parte do usuário' },
    });
  }

  // 12. Create Conversations for Inbox
  const convAna = await prisma.conversation.create({
    data: {
      companyId: company.id,
      contactId: createdContacts[0].id,
      unreadCount: 1,
      lastMessage: 'Gostaria de saber mais sobre a oferta!',
      lastMessageAt: new Date(),
      status: 'OPEN',
    },
  });

  await prisma.inboxMessage.create({
    data: {
      conversationId: convAna.id,
      sender: 'OPERATOR',
      senderName: 'Carlos Oliveira',
      text: 'Olá, Ana! Como posso te ajudar hoje com a oferta VIP?',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  });

  await prisma.inboxMessage.create({
    data: {
      conversationId: convAna.id,
      sender: 'CONTACT',
      senderName: 'Ana Pereira',
      text: 'Gostaria de saber mais sobre a oferta!',
      createdAt: new Date(),
    },
  });

  const convLucas = await prisma.conversation.create({
    data: {
      companyId: company.id,
      contactId: createdContacts[1].id,
      unreadCount: 0,
      lastMessage: 'Muito obrigado pelas informações!',
      lastMessageAt: new Date(Date.now() - 2 * 3600 * 1000),
      status: 'OPEN',
    },
  });

  await prisma.inboxMessage.create({
    data: {
      conversationId: convLucas.id,
      sender: 'CONTACT',
      senderName: 'Lucas Mendes',
      text: 'Muito obrigado pelas informações!',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
  });

  // 13. Create Automations
  const autoWelcome = await prisma.automation.create({
    data: {
      companyId: company.id,
      name: 'Boas-vindas para Novos Contatos',
      description: 'Envia mensagem automática assim que o contato é cadastrado',
      triggerType: 'NEW_CONTACT',
      status: 'ACTIVE',
      executionCount: 12,
    },
  });

  await prisma.automationStep.create({
    data: {
      automationId: autoWelcome.id,
      stepOrder: 1,
      type: 'ACTION_SEND_MSG',
      configJson: JSON.stringify({ message: 'Seja bem-vindo(a) à Acme Corp! É um prazer ter você aqui.' }),
    },
  });

  const autoOptOut = await prisma.automation.create({
    data: {
      companyId: company.id,
      name: 'Opt-Out Automático via Palavra-Chave',
      description: 'Registra o opt-out LGPD quando o cliente envia PARAR ou CANCELAR',
      triggerType: 'MESSAGE_RECEIVED',
      status: 'ACTIVE',
      executionCount: 4,
    },
  });

  await prisma.automationStep.create({
    data: {
      automationId: autoOptOut.id,
      stepOrder: 1,
      type: 'CONDITION',
      configJson: JSON.stringify({ keywords: ['PARAR', 'CANCELAR', 'SAIR', 'STOP'] }),
    },
  });

  // 14. Audit Logs
  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      userId: adminUser.id,
      action: 'LOGIN',
      resource: 'USER_SESSION',
      details: 'Login efetuado com sucesso via Web',
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      userId: adminUser.id,
      action: 'DISPATCH_CAMPAIGN',
      resource: 'CAMPAIGN',
      details: `Campanha "${campaign1.name}" finalizada para 5 destinatários`,
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Zendify database seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
