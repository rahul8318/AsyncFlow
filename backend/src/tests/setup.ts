import { beforeAll, afterAll } from 'vitest';
import { prisma } from '../services/prisma.js';

beforeAll(async () => {
  // Ensure connection to test database
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
