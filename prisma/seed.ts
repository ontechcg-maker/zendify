import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Zendify database seed...');

  // 1. Create Default Plans
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

  // 2. Create Initial Default Clean Company
  const company = await prisma.company.upsert({
    where: { slug: 'minha-empresa' },
    update: {},
    create: {
      name: 'Minha Empresa',
      slug: 'minha-empresa',
      status: 'ACTIVE',
      planId: proPlan.id,
    },
  });

  // Create Subscription
  const existingSub = await prisma.subscription.findFirst({ where: { companyId: company.id } });
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        companyId: company.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 3. Create Admin User
  await prisma.user.upsert({
    where: { email: 'admin@zendify.app' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Administrador',
      email: 'admin@zendify.app',
      passwordHash: 'admin123',
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seed finalizado com sucesso! Banco zerado e pronto para dados reais.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
