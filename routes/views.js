const express = require('express');
const router = express.Router();
const viewsController = require('../controllers/viewsController');

router.post('/', viewsController.addView);
router.get('/', viewsController.getViews);
router.delete('/', viewsController.deleteView);

module.exports = router;

