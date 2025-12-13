const prisma = require('../../config/prisma');
const { createResponse } = require('../../utils/response');

/**
 * Get all orders with pagination
 * GET /api/admin/order?userId=&limit=5&page=1
 */
const getOrders = async (req, res, next) => {
  try {
    const { userId, limit = 5, page = 1 } = req.query;
    const orderLimit = Number(limit);
    const orderPage = Number(page);
    const skip = (orderPage - 1) * orderLimit;

    const totalOrders = await prisma.order.count({});

    const totalPages = Math.ceil(totalOrders / orderLimit);

    const orders = await prisma.order.findMany({
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
      createResponse({ 
        data: { orders, totalPages }, 
        status: true 
      })
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json(
      createResponse({ 
        error: 'Internal Server Error', 
        status: false 
      })
    );
  }
};

/**
 * Update order
 * PATCH /api/admin/order/:id
 * Note: In Next.js it was req.query.id, but in Express we use req.params.id
 */
const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params; // Changed from req.query in Next.js
    const {
      status,
      paymentStatus,
      items,
      shippingAddress,
      billingAddress,
    } = req.body;

    if (!id) {
      return res.status(400).json(
        createResponse({ 
          error: 'Order ID is required', 
          status: false 
        })
      );
    }

    // Fetch the existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingOrder) {
      return res.status(404).json(
        createResponse({ 
          error: 'Order not found', 
          status: false 
        })
      );
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: {
        status: status || existingOrder.status,
        paymentStatus: paymentStatus || existingOrder.paymentStatus,
        items: items ? { set: items } : existingOrder.items,
        shippingAddress: shippingAddress || existingOrder.shippingAddress,
        billingAddress: billingAddress || existingOrder.billingAddress,
      },
    });

    return res.status(200).json(
      createResponse({ 
        message: 'Order updated successfully', 
        data: updatedOrder, 
        status: true 
      })
    );
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json(
      createResponse({ 
        error: 'Internal Server Error', 
        status: false 
      })
    );
  }
};

module.exports = {
  getOrders,
  updateOrder,
};

