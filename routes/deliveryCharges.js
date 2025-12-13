const express = require('express');
const router = express.Router();
const deliveryChargesController = require('../controllers/deliveryChargesController');

router.post('/', deliveryChargesController.createChargeRule);
router.get('/', deliveryChargesController.listChargeRules);

module.exports = router;

