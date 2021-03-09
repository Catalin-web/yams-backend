/** @format */
const asyncHandler = require('../middleware/async');
const Game = require('../models/Game');
const ErrorResponse = require('../utils/errorResponse');
// @desc     Create game
// @route    POST /api/v1/yams_online/game/create
// @acces    Create / Private
exports.createGame = asyncHandler(async (req, res, next) => {
	if (!req.lobby) return next(new ErrorResponse('Not authorize', 401));
	const game = await Game.create({
		users: req.lobby.users,
		current: req.user.username,
		room: req.lobby.room,
	});
	res.status(200).json({ succes: 'true', game });
});
// @desc     Get game
// @route    Get /api/v1/yams_online/game/get
// @acces    Private / Private
exports.getGame = asyncHandler(async (req, res, next) => {
	if (!req.lobby) return next(new ErrorResponse('Not authorize', 401));
	const game = await Game.findOne({ room: req.lobby.room });
	if (!game) return next(new ErrorResponse('Not found', 404));
	for (let i = 0; i < game.users.length; ++i) {
		if (game.users[i].username === req.user.username) {
			game.users[i].ready = true;
			await game.save();
			break;
		}
	}
	res.status(200).json({ succes: 'true', game });
});
// @desc     Update game for current user
// @route    PUT /api/v1/yams_online/game/update
// @acces    Private / Private
exports.updateGame = asyncHandler(async (req, res, next) => {
	if (!req.lobby) return next(new ErrorResponse('Not authorize', 401));
	const game = await Game.findOne({ room: req.lobby.room });
	if (!game) return next(new ErrorResponse('Not found', 404));
	const {
		zar1,
		zar2,
		zar3,
		zar4,
		zar5,
		zar6,
		totalZar,
		P,
		B3,
		Q,
		F,
		K,
		Y,
		m,
		M,
		totalMari,
		type,
		rolled,
		dice,
		current,
	} = req.body;
	if (!type) return next(new ErrorResponse('Please add a type', 401));
	for (let i = 0; i < game.users.length; ++i) {
		if (game.users[i].username === req.user.username) {
			if (zar1) game.users[i][type].zar1 = zar1;
			if (zar2) game.users[i][type].zar2 = zar2;
			if (zar3) game.users[i][type].zar3 = zar3;
			if (zar4) game.users[i][type].zar4 = zar4;
			if (zar5) game.users[i][type].zar5 = zar5;
			if (zar6) game.users[i][type].zar6 = zar6;
			if (totalZar) game.users[i][type].totalZar = totalZar;
			if (P) game.users[i][type].P = P;
			if (B3) game.users[i][type].B3 = B3;
			if (Q) game.users[i][type].Q = Q;
			if (K) game.users[i][type].K = K;
			if (Y) game.users[i][type].Y = Y;
			if (m) game.users[i][type].m = m;
			if (M) game.users[i][type].M = M;
			if (F) game.users[i][type].F = F;
			if (totalMari) game.users[i].totalMari = totalMari;
			break;
		}
	}
	if (rolled) game.rolled = rolled;
	if (dice) game.dice = dice;
	if (current) game.current = current;
	await game.save();
	res.status(200).json({ succes: 'true', game });
});
// @desc     Delete game
// @route    Delete /api/v1/yams_online/game/delete
// @acces    Private / Private
exports.deleteGame = asyncHandler(async (req, res, next) => {
	if (!req.lobby) return next(new ErrorResponse('Not authorize', 401));
	const game = await Game.findOne({ room: req.lobby.room });
	await game.remove();
	res.status(200).json({ succes: 'true' });
});
