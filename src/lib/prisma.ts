import { PrismaClient } from "../../generated/prisma";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const client = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = client;
