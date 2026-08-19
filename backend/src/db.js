require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

function withConnectTimeout(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "15");
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", "15");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const DATABASE_URL = withConnectTimeout(process.env.DATABASE_URL);
if (DATABASE_URL) {
  process.env.DATABASE_URL = DATABASE_URL;
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: DATABASE_URL ? { db: { url: DATABASE_URL } } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma };
