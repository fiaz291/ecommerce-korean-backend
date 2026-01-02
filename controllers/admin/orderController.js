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
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!id) {
      return res.status(400).json(
        createResponse({ error: "Order ID is required", status: false })
      );
    }

    const orderId = parseInt(id);

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json(
        createResponse({ error: "Order not found", status: false })
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status ?? existingOrder.status,
        paymentStatus: paymentStatus ?? existingOrder.paymentStatus,
      },
    });

    // ✅ Create financial transaction ONLY when becoming delivered
    const isBecomingDelivered =
      existingOrder.status !== "delivered" &&
      status === "delivered";

    if (isBecomingDelivered) {
      // 🔐 Extra safety: ensure no duplicate transaction exists
      const alreadyExists = await prisma.financialTransaction.findFirst({
        where: {
          orderId: existingOrder.id,
          transactionType: "order",
        },
      });

      if (!alreadyExists) {
        await prisma.financialTransaction.create({
          data: {
            userId: existingOrder.userId,
            orderId: existingOrder.id,
            storeId: existingOrder.storeId,
            transactionType: "order",
            amount: existingOrder.totalAmount,
            currency: "PKR",
            description: `Order #${existingOrder.id} delivered`,
          },
        });
      }
    }

    return res.status(200).json(
      createResponse({
        message: "Order updated successfully",
        data: updatedOrder,
        status: true,
      })
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json(
      createResponse({ error: "Internal Server Error", status: false })
    );
  }
};


module.exports = {
  getOrders,
  updateOrder,
};

