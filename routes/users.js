const express = require('express');
const router = express.Router();
const usersController = require('../controllers/admin/usersController');

//router.get('/', usersController.getUsers);
router.get('/get-org-emp', usersController.getOrgEmployees);

module.exports = router;

