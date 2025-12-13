const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.get('/', tagController.getProductsByTag);

module.exports = router;

