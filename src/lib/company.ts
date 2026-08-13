import { prisma } from '@/lib/prisma';

export async function getOrCreateCompany() {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Minha Empresa',
        slug: 'minha-empresa',
      },
    });
  }
  return company;
}
