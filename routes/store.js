const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

router.post('/', storeController.createStore);
router.get('/', storeController.getStores);
router.patch('/', storeController.updateStore);
router.delete('/', storeController.deleteStore);

module.exports = router;

