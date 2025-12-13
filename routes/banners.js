const express = require('express');
const router = express.Router();
const bannersController = require('../controllers/bannersController');

router.post('/', bannersController.createBanner);
router.get('/', bannersController.getBanners);

module.exports = router;

