const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');

/**
 * Add/Update Cart Item
 * POST /api/cart
 */
const addCartItem = async (req, res, next) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity || quantity < 1) {
    return res.status(400).json(
      createResponse({ error: 'Invalid input', status: false })
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.inventory < quantity) {
      return res.status(404).json(
        createResponse({ message: 'Product not found or insufficient inventory', status: false })
      );
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingCartItem) {
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity },
        include: { product: true },
      });

      return res.status(200).json(
        createResponse({ data: updatedCartItem, status: true })
      );
    } else {
      const newCartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: { product: true },
      });

      return res.status(201).json(
        createResponse({ data: newCartItem, status: true })
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Get Cart Items
 * GET /api/cart?userId=123
 */
const getCartItems = async (req, res, next) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json(
      createResponse({ error: 'User ID is required', status: false })
    );
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: Number(userId) },
      include: { product: true },
    });

    return res.status(200).json(
      createResponse({ data: cartItems, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Delete Cart Item
 * DELETE /api/cart
 */
const deleteCartItem = async (req, res, next) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json(
      createResponse({ error: 'Invalid input', status: false })
    );
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json(
        createResponse({ error: 'Cart item not found', status: false })
      );
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return res.status(204).json(
      createResponse({ message: 'Cart item deleted', status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ error: 'Internal Server Error', status: false })
    );
  }
};

module.exports = {
  addCartItem,
  getCartItems,
  deleteCartItem,
};

