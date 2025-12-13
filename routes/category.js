const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.get('/get-all', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);
router.put('/', categoryController.updateCategory);
router.patch('/', categoryController.patchCategory);
router.delete('/', categoryController.deleteCategory);
router.post('/slug-checker', categoryController.checkSlug);

module.exports = router;

