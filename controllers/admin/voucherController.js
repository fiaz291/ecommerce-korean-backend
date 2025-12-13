const prisma = require('../../config/prisma');
const { createResponse } = require('../../utils/response');

/**
 * Create Voucher (Admin)
 * POST /api/admin/voucher
 */
const createVoucher = async (req, res, next) => {
  try {
    const { code, amount, isActive, expiresAt, description, storeId } = req.body;

    const voucher = await prisma.voucher.create({
      data: {
        code,
        amount,
        isActive: isActive ?? true,
        expiresAt,
        description,
        storeId,
      },
    });

    return res.status(201).json(
      createResponse({ data: voucher, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Get Voucher(s) (Admin)
 * GET /api/admin/voucher?id=123
 */
const getVouchers = async (req, res, next) => {
  try {
    const { id } = req.query;

    if (id) {
      const voucher = await prisma.voucher.findUnique({
        where: { id: parseInt(id) },
        include: { store: true, financialTransactions: true, userVouchers: true },
      });

      if (!voucher) {
        return res.status(404).json(
          createResponse({ error: 'Voucher not found', status: false })
        );
      }

      return res.status(200).json(
        createResponse({ data: voucher, status: true })
      );
    } else {
      const vouchers = await prisma.voucher.findMany({
        include: { store: true },
      });

      return res.status(200).json(
        createResponse({ data: vouchers, status: true })
      );
    }
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Update Voucher (Admin)
 * PUT /api/admin/voucher?id=123
 */
const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.query;
    const { code, amount, isActive, expiresAt, description, storeId } = req.body;

    if (!id) {
      return res.status(400).json(
        createResponse({ error: 'Voucher ID is required', status: false })
      );
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: parseInt(id) },
      data: {
        code,
        amount,
        isActive,
        expiresAt,
        description,
        storeId,
      },
    });

    return res.status(200).json(
      createResponse({ data: updatedVoucher, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Delete Voucher (Admin)
 * DELETE /api/admin/voucher?id=123
 */
const deleteVoucher = async (req, res, next) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json(
        createResponse({ error: 'Voucher ID is required', status: false })
      );
    }

    const deletedVoucher = await prisma.voucher.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json(
      createResponse({ data: deletedVoucher, status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

/**
 * Search Voucher (Admin)
 * GET /api/admin/voucher/search?text=CODE123
 */
const searchVoucher = async (req, res, next) => {
  try {
    let { text } = req.query;
    const voucher = await prisma.voucher.findUnique({
      where: { code: text }
    });
    
    return res.status(200).json(
      createResponse({ data: voucher, status: true })
    );
  } catch (error) {
    console.error('voucher not found:', error);
    return res.status(500).json(
      createResponse({ error: error.message, status: false })
    );
  }
};

module.exports = {
  createVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher,
  searchVoucher,
};

