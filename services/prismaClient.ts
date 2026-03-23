import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production'

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  })

  return new PrismaClient({ adapter })
}

function isCompatibleClient(client: PrismaClient | undefined): client is PrismaClient {
  if (!client) return false

  const candidate = client as PrismaClient & {
    activityLog?: unknown
    cardComment?: unknown
  }

  return typeof candidate.activityLog !== 'undefined' && typeof candidate.cardComment !== 'undefined'
}

export const prismaClient: PrismaClient = isCompatibleClient(globalForPrisma.prismaClient)
  ? globalForPrisma.prismaClient
  : createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = prismaClient
}
