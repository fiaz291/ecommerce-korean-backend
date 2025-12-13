const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/', cartController.addCartItem);
router.get('/', cartController.getCartItems);
router.delete('/', cartController.deleteCartItem);

module.exports = router;

