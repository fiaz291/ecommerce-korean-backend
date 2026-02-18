const express = require('express');
const router = express.Router();
const bannersController = require('../controllers/bannersController');

router.post('/', bannersController.createBanner);
router.get('/', bannersController.getBanners);
router.patch('/reorder', bannersController.reorderBanners);
router.get('/:id', bannersController.getBannerById);
router.put('/:id', bannersController.updateBanner);
router.delete('/:id', bannersController.deleteBanner);

module.exports = router;

