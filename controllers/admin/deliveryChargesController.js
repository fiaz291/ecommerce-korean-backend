const prisma = require('../../config/prisma');
const { createResponse } = require('../../utils/response');

/**
 * Create Delivery Charge Rule (Admin)
 * POST /api/admin/delivery-charges
 */
const createChargeRule = async (req, res, next) => {
  const { deliveryType, minOrderTotal = 0, charge, region } = req.body;

  if (!deliveryType || typeof charge !== 'number') {
    return res.status(400).json(
      createResponse({ error: 'Missing required fields', status: false })
    );
  }

  try {
    const rule = await prisma.deliveryChargeRule.create({
      data: {
        deliveryType,
        minOrderTotal,
        charge,
        region
      },
    });

    return res.status(201).json(
      createResponse({ message: 'Delivery charge rule created', data: rule, status: true })
    );
  } catch (error) {
    console.error('Error creating delivery charge rule:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * List Delivery Charge Rules (Admin)
 * GET /api/admin/delivery-charges
 */
const listChargeRules = async (req, res, next) => {
  try {
    const rules = await prisma.deliveryChargeRule.findMany();
    return res.status(200).json(
      createResponse({ data: rules, status: true })
    );
  } catch (error) {
    console.error('Error fetching delivery charge rules:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  createChargeRule,
  listChargeRules,
};

