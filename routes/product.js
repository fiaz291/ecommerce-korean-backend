const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.patch('/', productController.updateProduct);
router.get('/search', productController.searchProducts);
router.post('/slug-checker', productController.checkProductSlug);
router.get('/category', productController.getProductsByCategory);
router.get('/best-selling', productController.getBestSellingProducts);
router.get('/free-delivery', productController.getFreeDeliveryProducts);
router.get('/super-deals', productController.getSuperDealsProducts);
router.get('/top-of-week', productController.getTopOfWeekProducts);
router.get('/:productSlug', productController.getProductBySlug);

module.exports = router;

