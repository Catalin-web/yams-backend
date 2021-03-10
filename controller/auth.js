/** @format */

const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
/// !!! Send token response !!! ////
const sendTokenResponse = (user, statusCode, res) => {
	const token = user.getSignedJwtToken();

	const options = {
		sameSite: 'lax',
		path: '/',
		Proxy: true,
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
		),
		secure: true,
		httpOnly: true,
	};
	// if (process.env.NODE_ENV == 'production') {
	// 	options.secure = true;
	// }
	user.password = null;
	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ succes: true, data: user });
};
/// ///
// @desc     Register user
// @route    POST /api/v1/yams_online/auth/register
// @acces    Public
exports.register = asyncHandler(async (req, res, next) => {
	const { firstName, lastName, email, password, username } = req.body;
	// Create users
	const user = await User.create({
		firstName,
		lastName,
		email,
		password,
		username,
	});
	sendTokenResponse(user, 200, res);
});
// @desc     Get current logged in user
// @route    POST /api/v1/yams_online/auth/login
// @acces    Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	sendTokenResponse(user, 200, res);
});
// @desc     Login user
// @route    POST /api/v1/auth/auth/login
// @acces    Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	// Validate email and password
	if (!email || !password) {
		return next(
			new ErrorResponse('Please provide an email and password', 400),
		);
	}
	//Check for user
	const user = await User.findOne({ email }).select('+password');
	if (!user) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}
	//Check if password matches
	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	sendTokenResponse(user, 200, res);
});
// @desc     Forgot password
// @route    POST /api/v1/auth/forgotpassword
// @acces    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const email = req.body.email;
	const user = await User.findOne({ email });
	// const user = null;
	if (!user) {
		return next(
			new ErrorResponse('There is no user with that email', 404),
		);
	}
	//Create rseturl
	const resetToken = user.getResetPasswordToken();
	const resetURL = `${req.protocol}://${req.get(
		'host',
	)}/api/v1/auth/resetpassword/${resetToken}`;
	const message = `You are reciving this email because you (or someone else) requested the reset of a password. Please make a PUT request to: ${resetURL}${resetToken}`;
	try {
		// await sendEmail({
		// 	email: user.email,
		// 	subject: 'Password reset token',
		// 	message,
		// });
		await user.save({
			validateBeforeSave: false,
		});
		res.status(200).json({ succes: true, resetToken });
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({
			validateBeforeSave: true,
		});
		return next(new ErrorResponse('Email could not be sent', 500));
	}
});
// @desc     Reset password
// @route    PUT /api/v1/auth/yams_online/resetpassword/:resetToken
// @acces    Public
exports.resetpassword = asyncHandler(async (req, res, next) => {
	// Get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resetToken.toString('hex'))
		.digest('hex');
	// const resetPasswordToken = req.params.resetToken;
	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: {
			$gt: Date.now(),
		},
	});
	if (!user) {
		return next(new ErrorResponse('Invalid token', 400));
	}
	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save({
		validateBeforeSave: true,
	});
	sendTokenResponse(user, 200, res);
});
// @desc     Update user details
// @route    PUT /api/v1/yams_online/auth/updatedetails
// @acces    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		username: req.body.username,
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
	};
	if (!fieldsToUpdate.username)
		fieldsToUpdate.username = req.user.username;
	if (!fieldsToUpdate.email) fieldsToUpdate.email = req.user.email;
	if (!fieldsToUpdate.firstName)
		fieldsToUpdate.firstName = req.user.firstName;
	if (!fieldsToUpdate.lastName)
		fieldsToUpdate.lastName = req.user.lastName;
	const user = await User.findByIdAndUpdate(
		req.user.id,
		fieldsToUpdate,
		{
			new: true,
			runValidators: true,
		},
	);

	res.status(200).json({
		succes: true,
		data: user,
	});
});
// @desc     Update password
// @route    PUT /api/v1/yams_online/auth/uptdatepassword
// @acces    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.user.id).select(
		'+password',
	);
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}
	user.password = req.body.newPassword;
	await user.save({ runValidators: true });
	sendTokenResponse(user, 200, res);
});
// @desc     Log user out / clear cookie
// @route    GET /api/v1/yams_online/auth/logout
// @acces    Private
exports.logout = asyncHandler(async (req, res, next) => {
	const options = {
		sameSite: 'strict',
		path: '/',
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};
	res
		.status(200)
		.cookie('token', 'none', options)
		.json({ succes: true });
});
// @desc     Log user out / clear cookie
// @route    GET /api/v1/yams_online/auth/delete
// @acces    Private
exports.deleteAcc = asyncHandler(async (req, res, next) => {
	const { password } = req.body;
	const user = await User.findByIdAndUpdate(req.user.id).select(
		'+password',
	);
	if (!(await user.matchPassword(password))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}
	await User.findByIdAndDelete(req.user.id);
	res.status(200).cookie('token', 'none').json({ succes: true });
});
