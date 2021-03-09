/** @format */
const mongoose = require('mongoose');
const jwp = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	score: {
		type: Number,
		required: true,
	},
});
const historySchema = new mongoose.Schema({
	room: {
		type: String,
		required: true,
	},
	maxScore: {
		type: Number,
		required: true,
	},
	users: {
		type: [User],
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('History', historySchema);
