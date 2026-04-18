import { DueDateType, PrismaClient, UnitSystem } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env["DATABASE_URL"] });

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export function UnitSystemToString(system: UnitSystem) {
  switch (system) {
    case UnitSystem.WEIGHT:
      return "Weight";
    case UnitSystem.VOLUME:
      return "Volume";
    default:
      return "Abstract";
  }
}

export function DueDateTypeToString(duedate: DueDateType) {
  switch (duedate) {
    case DueDateType.BEST_BEFORE:
      return "Best before";
    case DueDateType.EXPIRY_DATE:
      return "Expires at";
    default:
      return "No expiry";
  }
}
