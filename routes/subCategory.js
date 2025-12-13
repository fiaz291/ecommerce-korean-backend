const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

router.get('/', subCategoryController.getSubCategories);
router.get('/get-all', subCategoryController.getAllSubCategories);
router.get('/:id', subCategoryController.getSubCategoriesByCategory);
router.post('/', subCategoryController.createSubCategory);
router.put('/', subCategoryController.updateSubCategory);
router.patch('/', subCategoryController.patchSubCategory);
router.delete('/', subCategoryController.deleteSubCategory);

module.exports = router;

