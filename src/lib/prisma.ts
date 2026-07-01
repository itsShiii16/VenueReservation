import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

declare global {
  var prisma: PrismaClient | undefined;
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV === 'production') {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient();
    }
    return prismaInstance;
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    }
    return global.prisma;
  }
}

// Proxy wrapper that forwards all operations dynamically to getPrisma() to defer initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client, prop);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
