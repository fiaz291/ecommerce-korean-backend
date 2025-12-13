const prisma = require('../config/prisma');
const { createResponse } = require('../utils/response');
const { orderStatuses } = require('../utils/orderStatuses');

/**
 * Create Order
 * POST /api/order
 */
const createOrder = async (req, res, next) => {
  const { userId, orderItems, orderAddress, billingAddress, vouchers, deliveryChargesId } = req.body;

  if (!userId || !Array.isArray(orderItems) || orderItems.length === 0 || !orderAddress) {
    return res.status(400).json(
      createResponse({ error: 'Invalid input', status: false })
    );
  }

  try {
    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = await prisma.$transaction(async (prisma) => {
      const createdOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          deliveryChargeRuleId: deliveryChargesId,
          discount: vouchers ? vouchers.amount : 0,
          orderAddress,
          billingAddress,
          status: orderStatuses.pending.key,
          orderItems: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              slug: item.slug,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      const cartItemIds = orderItems.map((item) => item.cartId);
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: cartItemIds },
        },
      });

      return createdOrder;
    });

    await Promise.all(
      orderItems.map((item) => updateProductTotalSold(item.productId, item.quantity))
    );

    return res.status(201).json(
      createResponse({ data: order, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', error: error.message, status: false })
    );
  }
};

/**
 * Get User Orders
 * GET /api/order?userId=123&limit=20&page=1
 */
const getUserOrders = async (req, res, next) => {
  const { userId, limit = 20, page = 1 } = req.query;
  const orderLimit = Number(limit);
  const orderPage = Number(page);
  const skip = (orderPage - 1) * orderLimit;

  if (!userId) {
    return res.status(400).json(
      createResponse({ error: 'Invalid input', status: false })
    );
  }

  try {
    const totalOrders = await prisma.order.count({
      where: { userId: parseInt(userId) },
    });

    const totalPages = Math.ceil(totalOrders / orderLimit);

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      skip: skip,
      take: orderLimit,
    });

    return res.status(200).json(
      createResponse({ data: { orders, totalPages }, status: true })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(
      createResponse({ message: 'Internal Server Error', status: false })
    );
  }
};

/**
 * Helper function to update product total sold
 */
async function updateProductTotalSold(productId, quantitySold) {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        totalSold: {
          increment: quantitySold,
        },
      },
    });

    console.log('Product updated:', updatedProduct);
    return updatedProduct;
  } catch (error) {
    console.error('Error updating totalSold:', error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
};

