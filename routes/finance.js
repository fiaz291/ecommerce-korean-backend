const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

router.get("/transactions", financeController.getTransactions);
router.get("/summary", financeController.getDateWiseSummary);
router.get("/totals", financeController.getTotals);

module.exports = router;

