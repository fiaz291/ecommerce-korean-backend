const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

router.post('/', voucherController.createVoucher);
router.get('/', voucherController.getVouchers);
router.put('/', voucherController.updateVoucher);
router.delete('/', voucherController.deleteVoucher);
router.get('/search', voucherController.searchVoucher);

module.exports = router;

