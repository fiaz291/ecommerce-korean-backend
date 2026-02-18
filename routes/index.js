const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin');

// Admin routes
router.use('/admin', adminRoutes);

// User routes
router.use('/user', require('./user'));

// Users routes
router.use('/users', require('./users'));

// Product routes
router.use('/product', require('./product'));

// Category routes
router.use('/category', require('./category'));

// Sub-category routes
router.use('/sub-categories', require('./subCategory'));

// Cart routes
router.use('/cart', require('./cart'));

// Order routes
router.use('/order', require('./order'));

// Favorites routes
router.use('/favorites', require('./favorites'));

// Voucher routes
router.use('/voucher', require('./voucher'));

// Banner routes
router.use('/banners', require('./banners'));

// Views routes
router.use('/views', require('./views'));

// Tag routes
router.use('/tag', require('./tag'));

// Store routes
router.use('/store', require('./store'));

// Delivery charges routes
router.use('/delivery-charges', require('./deliveryCharges'));

// Email routes
router.use('/email', require('./email'));

// Finance Routes
router.use('/finance', require('./finance'));

// Upload Routes
router.use('/upload', require('./upload'));

module.exports = router;

