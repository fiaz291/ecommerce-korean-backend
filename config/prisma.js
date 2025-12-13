const { PrismaClient } = require("@prisma/client");

let prisma;

/**
 * Initialize Prisma Client ONCE.
 */
function initializePrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "production"
          ? ["error"]
          : ["query", "info", "warn", "error"],
    });
  }
  return prisma;
}

/**
 * Get Prisma instance.
 * Throws error if not initialized.
 */
function getPrisma() {
  if (!prisma) {
    throw new Error(
      "Prisma not initialized! Call initializePrisma() in server.js"
    );
  }
  return prisma;
}

module.exports = {
  initializePrisma,
  getPrisma,
};
