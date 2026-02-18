const prisma = require('../config/prisma');
const { bucket } = require('../config/firebase');
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
 * GET /api/banners?bannerType=1&active=true
 */
const getBanners = async (req, res, next) => {
  try {
    const { bannerType, active } = req.query;

    const where = {};
    if (bannerType) where.bannerType = Number(bannerType);
    if (active === 'true') where.active = true;
    if (active === 'false') where.active = false;

    const banners = await prisma.banner.findMany({
      where,
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

/**
 * Get Banner by ID
 * GET /api/banners/:id
 */
const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!banner) {
      return res.status(404).json(
        createResponse({ error: 'Banner not found', status: false })
      );
    }

    return res.status(200).json(
      createResponse({ data: banner, status: true })
    );
  } catch (error) {
    console.error('Error fetching banner:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Update Banner
 * PUT /api/banners/:id
 */
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, url, active, order, productId, bannerType } = req.body;

    const existing = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json(
        createResponse({ error: 'Banner not found', status: false })
      );
    }

    // If image URL changed, delete the old image from Firebase Storage
    if (url && url !== existing.url) {
      try {
        const bucketName = bucket.name;
        const filePath = existing.url.replace(
          `https://storage.googleapis.com/${bucketName}/`,
          ''
        );
        await bucket.file(filePath).delete();
      } catch (err) {
        console.error('Failed to delete old banner image:', err.message);
      }
    }

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (url !== undefined) dataToUpdate.url = url;
    if (active !== undefined) dataToUpdate.active = active;
    if (order !== undefined) dataToUpdate.order = Number(order);
    if (productId !== undefined) dataToUpdate.productId = productId ? Number(productId) : null;
    if (bannerType !== undefined) dataToUpdate.bannerType = Number(bannerType);

    const updated = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    return res.status(200).json(
      createResponse({ data: updated, status: true })
    );
  } catch (error) {
    console.error('Error updating banner:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Delete Banner
 * DELETE /api/banners/:id
 */
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!banner) {
      return res.status(404).json(
        createResponse({ error: 'Banner not found', status: false })
      );
    }

    await prisma.banner.delete({ where: { id: parseInt(id) } });

    // Delete image from Firebase Storage
    if (banner.url) {
      try {
        const bucketName = bucket.name;
        const filePath = banner.url.replace(
          `https://storage.googleapis.com/${bucketName}/`,
          ''
        );
        await bucket.file(filePath).delete();
      } catch (err) {
        console.error('Failed to delete banner image:', err.message);
      }
    }

    return res.status(200).json(
      createResponse({ message: 'Banner deleted successfully', status: true })
    );
  } catch (error) {
    console.error('Error deleting banner:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Reorder Banners
 * PATCH /api/banners/reorder
 * Body: { banners: [{ id: 1, order: 1 }, { id: 2, order: 2 }] }
 */
const reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body;

    if (!banners || !Array.isArray(banners)) {
      return res.status(400).json(
        createResponse({ error: 'banners array is required', status: false })
      );
    }

    const updates = banners.map((b) =>
      prisma.banner.update({
        where: { id: b.id },
        data: { order: b.order },
      })
    );

    await prisma.$transaction(updates);

    return res.status(200).json(
      createResponse({ message: 'Banners reordered successfully', status: true })
    );
  } catch (error) {
    console.error('Error reordering banners:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  reorderBanners,
};

