const express = require('express');
const router = express.Router();
const adminUsersController = require('../../controllers/admin/usersController');

router.get('/', adminUsersController.getAdminUsers);
router.get('/all-users', adminUsersController.getAllUsers);
router.get('/get-org-emp', adminUsersController.getOrgEmployees);

module.exports = router;

