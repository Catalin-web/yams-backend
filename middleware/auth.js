/** @format */

const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Lobby = require('../models/Lobby');
//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	let token2;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else {
		if (req.cookies.token) {
			token = req.cookies.token;
		}
		if (req.cookies.room) {
			token2 = req.cookies.room;
		}
	}
	if (!token)
		return next(
			new ErrorResponse('Not authorize to access this route', 401),
		);
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		let decoded2;
		if (token2 != 'none' && token2)
			decoded2 = jwt.verify(token2, process.env.JWT_SECRET);
		req.user = await User.findById(decoded.id);
		if (token2 != 'none' && token2)
			req.lobby = await Lobby.findById(decoded2.id);
		next();
	} catch (err) {
		return next(
			new ErrorResponse('Not authorize to access this route', 401),
		);
	}
});
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role ${req.user.role} is not authorize to acces this route`,
					403,
				),
			);
		}
		next();
	};
};
