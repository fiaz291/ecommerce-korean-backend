const express = require('express');
const router = express.Router();
const userRoutes = require('./user');
// Admin user routes
router.use('/user', userRoutes);

// Admin order routes
router.use('/order', require('./order'));

// Admin voucher routes
router.use('/voucher', require('./voucher'));

// Admin users routes
router.use('/users', require('./users'));

// Admin delivery-charges routes
router.use('/delivery-charges', require('./deliveryCharges'));

module.exports = router;

