const { Prisma } = require("@prisma/client");
const prisma = require("../config/prisma");
const { createResponse } = require("../utils/response");

/**
 * Get financial transactions (date range)
 * GET /api/finance/transactions?from=2026-01-01&to=2026-01-31
 */
const getTransactions = async (req, res) => {
  const { from, to, storeId, type } = req.query;

  if (!from || !to) {
    return res.status(400).json(
      createResponse({
        status: false,
        error: "from and to dates are required",
      })
    );
  }

  try {
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
        ...(storeId && { storeId: Number(storeId) }),
        ...(type && { transactionType: type }),
      },
      include: {
        user: true,
        order: true,
        voucher: true,
        store: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json(
      createResponse({
        status: true,
        data: transactions,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({
        status: false,
        error: "Internal Server Error",
      })
    );
  }
};

/**
 * Get date-wise financial summary
 * GET /api/finance/summary?from=2026-01-01&to=2026-01-31
 */
const getDateWiseSummary = async (req, res) => {
  const { from, to, storeId } = req.query;

  if (!from || !to) {
    return res.status(400).json(
      createResponse({
        status: false,
        error: "from and to dates are required",
      })
    );
  }

  try {
    const baseQuery = Prisma.sql`
      SELECT
        DATE("createdAt") AS date,
        SUM(amount) AS total,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) AS expense,
        COUNT(*) AS transactions
      FROM "FinancialTransaction"
      WHERE "createdAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
    `;

    const storeFilter = storeId
      ? Prisma.sql` AND "storeId" = ${Number(storeId)}`
      : Prisma.empty;

    const finalQuery = Prisma.sql`
      ${baseQuery}
      ${storeFilter}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    const summary = await prisma.$queryRaw(finalQuery);

    // ✅ Convert BigInt → Number
    const normalizedSummary = summary.map((row) => ({
      date: row.date,
      total: Number(row.total || 0),
      income: Number(row.income || 0),
      expense: Number(row.expense || 0),
      transactions: Number(row.transactions || 0),
    }));

    return res.status(200).json(
      createResponse({
        status: true,
        data: normalizedSummary,
      })
    );
  } catch (error) {
    console.error("getDateWiseSummary error:", error);
    return res.status(500).json(
      createResponse({
        status: false,
        error: "Internal Server Error",
      })
    );
  }
};




/**
 * Get overall totals (revenue, expense, net)
 * GET /api/finance/totals?from=2026-01-01&to=2026-01-31
 */
const getTotals = async (req, res) => {
  const { from, to, storeId } = req.query;

  if (!from || !to) {
    return res.status(400).json(
      createResponse({
        status: false,
        error: "from and to dates are required",
      })
    );
  }

  try {
    const baseQuery = Prisma.sql`
      SELECT
        COALESCE(SUM(amount), 0) AS net,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS expense
      FROM "FinancialTransaction"
      WHERE "createdAt" BETWEEN ${new Date(from)} AND ${new Date(to)}
    `;

    const storeFilter = storeId
      ? Prisma.sql` AND "storeId" = ${Number(storeId)}`
      : Prisma.empty;

    const finalQuery = Prisma.sql`
      ${baseQuery}
      ${storeFilter}
    `;

    const result = await prisma.$queryRaw(finalQuery);

    return res.status(200).json(
      createResponse({
        status: true,
        data: result[0], // 👈 single object (correct)
      })
    );
  } catch (error) {
    console.error("getTotals error:", error);
    return res.status(500).json(
      createResponse({
        status: false,
        error: "Internal Server Error",
      })
    );
  }
};




module.exports = {
  getTransactions,
  getDateWiseSummary,
  getTotals,
};
