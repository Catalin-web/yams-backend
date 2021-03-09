/** @format */
const asyncHandler = require('../middleware/async');
const Lobby = require('../models/Lobby');
const ErrorResponse = require('../utils/ErrorResponse');
const crypto = require('crypto');
/// Send token response
const sendTokenResponse = (lobby, statusCode, res) => {
	const token = lobby.getSignedJwtToken();

	const options = {
		sameSite: 'strict',
		path: '/',
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};
	lobby.password = null;
	if (process.env.NODE_ENV == 'production') {
		options.secure = true;
	}
	res
		.status(statusCode)
		.cookie('room', token, options)
		.json({ succes: true, data: lobby });
};
// @desc     Register lobby
// @route    POST /api/v1/yams_online/lobby/register
// @acces    Public / Private
exports.registerLobby = asyncHandler(async (req, res, next) => {
	const { room, password } = req.body;
	// Create users
	const lobby = await Lobby.create({
		room,
		password,
	});
	sendTokenResponse(lobby, 200, res);
});
// @desc     Get current logged in lobby
// @route    Get /api/v1/yams_online/lobby/mylobby
// @acces    Private / Private
exports.getLobby = asyncHandler(async (req, res, next) => {
	let lobby;
	if (req.lobby) {
		lobby = await Lobby.findById(req.lobby.id);
		sendTokenResponse(lobby, 200, res);
	} else {
		next(new ErrorResponse('Not authorize to use this lobby', 401));
	}
});
// @desc     Get current logged in lobby
// @route    POST /api/v1/yams_online/auth/login
// @acces    Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	sendTokenResponse(user, 200, res);
});
// @desc     Login to a lobby
// @route    POST /api/v1/lobby/login
// @acces    Public / Private
exports.loginLobby = asyncHandler(async (req, res, next) => {
	const { room, password } = req.body;
	// Validate email and password
	if (!room || !password) {
		return next(
			new ErrorResponse('Please provide an email and password', 400),
		);
	}
	//Check for user
	const lobby = await Lobby.findOne({ room }).select('+password');
	if (!lobby) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}
	//Check if password matches
	const isMatch = await lobby.matchPassword(password);
	if (!isMatch) {
		return next(new ErrorResponse('Invalid credentials', 401));
	}

	sendTokenResponse(lobby, 200, res);
});
// @desc     Delete a lobby
// @route    Del /api/v1/lobby/delete
// @acces    Private / Private
exports.deleteLobby = asyncHandler(async (req, res, next) => {
	let lobby;
	const options = {
		sameSite: 'strict',
		path: '/',
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};
	if (req.lobby) {
		await Lobby.findByIdAndDelete(req.lobby.id);
		res
			.status(200)
			.cookie('room', 'none', options)
			.json({ succes: true });
	} else {
		next(new ErrorResponse('Not authorize to use this lobby', 401));
	}
});
// @desc     Add user to current lobby
// @route    Put /api/v1/lobby/addUser
// @acces    Private / Private
exports.addUser = asyncHandler(async (req, res, next) => {
	if (!req.lobby)
		return next(
			new ErrorResponse('Not authorize to use this lobby', 401),
		);
	const { role } = req.body;
	const username = req.user.username;
	let users = req.lobby.users;
	const obj = { role, username, index: 1 };
	if (users.find((element) => element.username == req.user.username)) {
		return next(new ErrorResponse('User already in the lobby', 400));
	}
	users.push(obj);

	const lobby = await Lobby.findById(req.lobby.id);
	lobby.users = users;
	await lobby.save({ runValidators: true });
	// lobby.updateUsers();
	lobby.users = users;
	res.status(200).json({
		succes: true,
		data: lobby,
	});
});
// @desc     Delete user from current lobby
// @route    Put /api/v1/lobby/deleteUser
// @acces    Private / Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
	if (!req.lobby)
		return next(
			new ErrorResponse('Not authorize to use this lobby', 401),
		);
	let users = req.lobby.users;
	users = users.filter((x, i) => x.username != req.user.username);
	const lobby = await Lobby.findById(req.lobby.id);
	lobby.users = users;
	await lobby.save({ runValidators: true });
	const options = {
		sameSite: 'strict',
		path: '/',
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};
	// lobby.updateUsers();
	res.status(200).cookie('room', 'none', options).json({
		succes: true,
	});
});
// @desc     Delete specific user by the lobby admmin
// @route    Put /api/v1/lobby/kickUser
// @acces    Private / Private
exports.kickUser = asyncHandler(async (req, res, next) => {
	if (!req.lobby)
		return next(
			new ErrorResponse('Not authorize to use this lobby', 401),
		);
	const { username } = req.body;
	let users = req.lobby.users;
	const username2 = req.user.username;
	for (let i = 0; i < users.length; ++i) {
		if (users[i].username === username2) {
			if (users[i].role === 'admin') {
				let lobby = await Lobby.findById(req.lobby.id);
				users = users.filter((a) => a.username != username);
				lobby.users = users;
				await lobby.save({ runValidators: true });
				return res.status(200).json({
					succes: true,
				});
			} else
				return next(new ErrorResponse('You are not the admin', 400));
		}
	}
	res.status(200).json({
		succes: true,
		username,
		username2,
		users,
	});
});
// @desc     Toggle ready for current user
// @route    Put /api/v1/lobby/toggleReady
// @acces    Private / Private
exports.toggleReady = asyncHandler(async (req, res, next) => {
	if (!req.lobby)
		return next(
			new ErrorResponse('Not authorize to use this lobby', 401),
		);
	const username = req.user.username;
	let users = req.lobby.users;
	let lobby = await Lobby.findById(req.lobby.id);
	for (let i = 0; i < users.length; ++i) {
		if (users[i].username === username) {
			users[i].ready = !users[i].ready;
			lobby.users = users;
			await lobby.save();
			break;
		}
	}
	res.status(200).json({
		succes: true,
	});
});
