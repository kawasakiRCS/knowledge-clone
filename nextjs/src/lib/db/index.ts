/**
 * Database connection utility using Prisma
 * 
 * @description Provides a singleton instance of PrismaClient for database operations
 * @see {@link https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices}
 */

import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Singleton PrismaClient instance
 * 
 * @description Creates a single instance of PrismaClient to prevent connection issues
 * in development due to hot reloading
 */
const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma
}

export { prisma }