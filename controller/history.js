/** @format */
const asyncHandler = require('../middleware/async');
const History = require('../models/History');
const Game = require('../models/Game');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

// @desc     Create history for current game
// @route    POST /api/v1/yams_online/history/create
// @acces    Private / Private
exports.create = asyncHandler(async (req, res, next) => {
	// Create history
	if (!req.lobby) return next(new ErrorResponse('Not authorize', 400));
	const { users, maxScore } = req.body;
	if (!users || !maxScore)
		return next(
			new ErrorResponse('Please include user and maxScore', 404),
		);
	await History.create({
		users,
		maxScore,
		room: req.lobby.room,
	});
	res.status(200).json({
		succes: true,
	});
});
// @desc     Get last game
// @route    Get /api/v1/yams_online/history/get
// @acces    Private / Private
exports.getLast = asyncHandler(async (req, res, next) => {
	// Create history
	if (!req.lobby) return next(new ErrorResponse('Not authorize', 400));
	const history = await History.find({ room: req.lobby.room });
	if (!history) return next(new ErrorResponse('Not authorize', 400));
	let maxDate = history[history.length - 1].createdAt;
	let lastGame = history[history.length - 1];
	res.status(200).json({
		succes: true,
		lastGame,
	});
});
// @desc     Get games for specific user
// @route    Get /api/v1/yams_online/history/get
// @acces    Private / Public
exports.getAll = asyncHandler(async (req, res, next) => {
	const history = await History.find();
	const username = req.user.username;
	let a = [];
	for (let i = 0; i < history.length; ++i) {
		for (let j = 0; j < history[i].users.length; ++j) {
			if (history[i].users[j].username === username) {
				a.push(history[i]);
			}
		}
	}
	res.status(200).json({
		succes: true,
		length: a.length,
		history: a,
	});
});
