const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Add Favorite
 * POST /api/favorites
 */
const addFavorite = async (req, res, next) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json(
      createResponse({ error: 'User ID and Product ID are required', status: false })
    );
  }

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    return res.status(201).json(
      createResponse({ data: favorite, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', error: error.message, status: false })
    );
  }
};

/**
 * Get User Favorites
 * GET /api/favorites?userId=123
 */
const getFavorites = async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json(
      createResponse({ error: 'User ID is required', status: false })
    );
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: parseInt(userId, 10) },
      include: {
        product: true,
      },
    });

    return res.status(200).json(
      createResponse({ data: favorites, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', error: error.message, status: false })
    );
  }
};

/**
 * Delete Favorite
 * DELETE /api/favorites
 */
const deleteFavorite = async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'ID is required', status: false })
    );
  }

  try {
    await prisma.favorite.delete({
      where: { id: parseInt(id, 10) }
    });

    return res.status(200).json(
      createResponse({ message: 'Item removed', status: true })
    );
  } catch (error) {
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', error: error.message, status: false })
    );
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  deleteFavorite,
};

