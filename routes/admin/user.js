const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/userController');


router.post('/', (adminUserController.createAdmin));
router.patch('/', adminUserController.updateAdmin);
router.post('/login', adminUserController.login);
router.get('/username-checker', adminUserController.checkUsername);

module.exports = router;

