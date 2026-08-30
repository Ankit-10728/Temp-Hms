const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
// const {
//     requestLoginOTP,
//     verifyOTPAndLogin,
//     verifySuperAdmin
// } = require('../controllers/authController');
const authController = require('../controllers/authController');
//router.post('/auth/request-otp', requestLoginOTP);
// router.post('/auth/login', verifySuperAdmin); // log in of superadmin via email & password
//router.post('/auth/verify-otp', verifyOTPAndLogin);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', protect, authController.changePassword);
module.exports = router;
