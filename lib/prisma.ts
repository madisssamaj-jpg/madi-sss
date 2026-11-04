// Singleton Prisma Client instance with fallback handling
let PrismaClientClass: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const clientModule = require('@prisma/client');
  PrismaClientClass = clientModule.PrismaClient;
} catch {
  PrismaClientClass = class FallbackPrismaClient {
    [key: string]: any;
  };
}

const globalForPrisma = globalThis as unknown as { prisma: any };

export const prisma =
  globalForPrisma.prisma ||
  (PrismaClientClass ? new PrismaClientClass() : {});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
