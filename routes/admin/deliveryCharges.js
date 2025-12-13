const express = require('express');
const router = express.Router();
const adminDeliveryChargesController = require('../../controllers/admin/deliveryChargesController');

router.post('/', adminDeliveryChargesController.createChargeRule);
router.get('/', adminDeliveryChargesController.listChargeRules);

module.exports = router;

