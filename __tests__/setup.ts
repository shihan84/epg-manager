import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

const prisma = new PrismaClient();

export async function setupTestDatabase() {
  // Create test database
  const testDbPath = join(process.cwd(), 'test.db');
  process.env.DATABASE_URL = `file:${testDbPath}`;

  // Run migrations
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Seed test data
  execSync('npx prisma db seed', { stdio: 'inherit' });
}

export async function cleanupTestDatabase() {
  await prisma.$disconnect();

  // Clean up test database
  const testDbPath = join(process.cwd(), 'test.db');
  try {
    execSync(`rm -f ${testDbPath}`);
  } catch (error) {
    console.warn('Failed to cleanup test database:', error);
  }
}

export { prisma };
