const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Add View
 * POST /api/views
 */
const addView = async (req, res, next) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json(
      createResponse({ error: 'userId and productId are required', status: false })
    );
  }

  try {
    await prisma.views.create({
      data: {
        userId: Number(userId),
        productId: Number(productId),
      },
    });

    // Ensure only the last 10 views are kept for the user
    const userViews = await prisma.views.findMany({
      where: { userId: Number(userId) },
      orderBy: { viewedAt: 'desc' },
      skip: 10,
    });

    // Delete older views
    const deleteIds = userViews.map((view) => view.id);
    if (deleteIds.length > 0) {
      await prisma.views.deleteMany({
        where: { id: { in: deleteIds } },
      });
    }

    return res.status(201).json(
      createResponse({ message: 'View added successfully', status: true })
    );
  } catch (error) {
    console.error('Error adding view:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get User Views
 * GET /api/views?userId=123
 */
const getViews = async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json(
      createResponse({ error: 'userId is required', status: false })
    );
  }

  try {
    const views = await prisma.views.findMany({
      where: { userId: parseInt(userId, 10) },
      orderBy: { viewedAt: 'desc' },
      take: 10,
      include: {
        product: true,
      },
    });

    return res.status(200).json(
      createResponse({ data: views, status: true })
    );
  } catch (error) {
    console.error('Error fetching views:', error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', error: error.message, status: false })
    );
  }
};

/**
 * Delete View
 * DELETE /api/views
 */
const deleteView = async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json(
      createResponse({ error: 'ID is required', status: false })
    );
  }

  try {
    await prisma.views.delete({
      where: { id: parseInt(id, 10) }
    });

    return res.status(200).json(
      createResponse({ message: 'View deleted successfully', status: true })
    );
  } catch (error) {
    console.error('Error deleting view:', error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  addView,
  getViews,
  deleteView,
};

