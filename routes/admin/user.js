const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/userController');

router.post('/login', adminUserController.login);
router.post('/', adminUserController.createAdmin);
router.patch('/', adminUserController.updateAdmin);
router.get('/username-checker', adminUserController.checkUsername);

module.exports = router;

