//lib is any externel service that we use to store data, in this case we are using prisma with postgresql

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client/extension"


const globalForPrisma = global as unknown as { prisma: PrismaClient  }
export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
export default prisma