const express = require('express');
const router = express.Router();
const adminVoucherController = require('../../controllers/admin/voucherController');

router.post('/', adminVoucherController.createVoucher);
router.get('/', adminVoucherController.getVouchers);
router.put('/', adminVoucherController.updateVoucher);
router.delete('/', adminVoucherController.deleteVoucher);
router.get('/search', adminVoucherController.searchVoucher);

module.exports = router;

