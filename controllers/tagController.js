const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Get Products by Tag
 * GET /api/tag?tag=kitchen&page=1&limit=1&minPrice=&maxPrice=
 */
const getProductsByTag = async (req, res, next) => {
  const { tag, page = 1, limit = 1, minPrice, maxPrice } = req.query;
  const minPriceInt = Number(minPrice);
  const maxPriceInt = Number(maxPrice);
  const orderLimit = Number(limit);
  const orderPage = Number(page);
  const skip = (orderPage - 1) * orderLimit;

  if (!tag) {
    return res.status(400).json(
      createResponse({ error: 'Tag is required', status: false })
    );
  }

  try {
    const priceFilter = {};

    if (minPriceInt) {
      priceFilter.gte = Number(minPriceInt);
    }

    if (maxPriceInt) {
      priceFilter.lte = Number(maxPriceInt);
    }

    const products = await prisma.product.findMany({
      where: {
        tags: {
          has: tag,
        },
        ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
      },
      take: orderLimit,
      skip: skip,
    });

    return res.status(200).json(
      createResponse({ data: products, status: true })
    );
  } catch (error) {
    console.error('Error fetching products by tag:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  getProductsByTag,
};

