const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');

// GET /api/admin/order - Get all orders with pagination
router.get('/', orderController.getOrders);

// PATCH /api/admin/order/:id - Update order
router.patch('/:id', orderController.updateOrder);

module.exports = router;

