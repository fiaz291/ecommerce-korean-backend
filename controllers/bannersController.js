const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Create Banner
 * POST /api/banners
 */
const createBanner = async (req, res, next) => {
  const { name, slug, url, active, order, productId, bannerType } = req.body;

  if (!name || !slug || !url) {
    return res.status(400).json(
      createResponse({ message: 'Fields "name", "slug", and "url" are required.', status: false })
    );
  }

  try {
    const banner = await prisma.banner.create({
      data: {
        name,
        slug,
        url,
        active: active ?? false,
        order: Number(order) ?? 1,
        productId: Number(productId),
        bannerType: Number(bannerType),
      },
    });

    return res.status(201).json(
      createResponse({ data: banner, status: true })
    );
  } catch (error) {
    console.error('Error creating banner:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal server error', error: error.message, status: false })
    );
  }
};

/**
 * Get Banners
 * GET /api/banners
 */
const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    
    return res.status(200).json(
      createResponse({ data: banners, status: true })
    );
  } catch (error) {
    console.error('Error fetching banners:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal server error', error: error.message, status: false })
    );
  }
};

module.exports = {
  createBanner,
  getBanners,
};

