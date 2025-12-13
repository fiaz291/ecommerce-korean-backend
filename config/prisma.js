const { PrismaClient } = require("@prisma/client");

let prisma;

/**
 * Initialize Prisma Client ONCE (singleton pattern).
 * This prevents multiple instances and connection pool exhaustion.
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

// Auto-initialize if called directly (for convenience)
// This allows: const prisma = require('./config/prisma');
initializePrisma();

module.exports = prisma; // Export the instance directly
module.exports.initializePrisma = initializePrisma; // Also export function for explicit initialization
module.exports.getPrisma = getPrisma; // Export getter function
