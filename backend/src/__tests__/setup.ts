import { beforeAll, afterAll } from 'vitest';
import prisma from '@/infrastructure/database/prisma';

beforeAll(async () => {
  console.log('🧪 Inicializando testing...');
});

afterAll(async () => {
  await prisma.$disconnect();
  console.log('✅ Tests completados');
});
