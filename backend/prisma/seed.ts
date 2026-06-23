import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 ${process.env.SEED_APP_NAME ?? 'Finora'} database seed`);
  console.log('');
  console.log('No default accounts or sample data are created.');
  console.log('Register a new account through the application to get started.');
  console.log('Default income and expense categories are added automatically on registration.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
