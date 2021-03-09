/** @format */

const express = require('express');
const router = express.Router({ mergeParams: true });
const {
	register,
	getMe,
	login,
	forgotPassword,
	resetpassword,
	updateDetails,
	updatePassword,
	logout,
	deleteAcc,
} = require('../controller/auth');
const { protect } = require('../middleware/auth');
router.route('/register').post(register);
router.route('/me').get(protect, getMe);
router.route('/logout').get(protect, logout);
router.route('/login').post(login);
router.route('/forgotpassword').put(forgotPassword);
router.put('/resetpassword/:resetToken', resetpassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.route('/delete').put(protect, deleteAcc);
module.exports = router;
