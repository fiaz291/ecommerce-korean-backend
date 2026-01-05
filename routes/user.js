const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userAdditionalController = require('../controllers/userAdditionalController');

router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/', userController.getUser);
router.patch('/', userController.updateUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/update-password', userController.updatePassword);
router.post('/verify-email', userController.verifyEmail);
router.post('/verify-number', userAdditionalController.verifyNumber);
router.get('/username-checker', userController.checkUsername);
router.get('/order', userController.getUserOrders);
router.post('/sendCode', userAdditionalController.sendCode);
router.get('/search', userController.searchUsers);
router.post('/socialSignin', userAdditionalController.socialSignin);

module.exports = router;

