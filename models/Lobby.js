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
	role: {
		type: String,
		required: true,
		enum: ['admin', 'player'],
		default: 'player',
	},
	ready: {
		type: Boolean,
		enum: [true, false],
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
const lobbySchema = new mongoose.Schema({
	room: {
		type: String,
		unique: true,
		required: [true, 'Please add a first name'],
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		select: false,
	},
	users: {
		type: [User],
	},
});
//Encrypt
lobbySchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});
lobbySchema.pre('save', async function (next) {
	const users = this.users;
	if (!users.find((a) => a.role === 'admin')) {
		if (users.length > 0) {
			let data1 = users[0].createdAt;
			users.map((a) => {
				if (a.createdAt > data1) data1 = a.createdAt;
			});
			let i;
			for (i = 0; i < users.length; ++i) {
				if (users[i].createdAt === data1) {
					this.users[i].role = 'admin';
					break;
				}
			}
		}
	}
	next();
});
/// Get token response method
lobbySchema.methods.getSignedJwtToken = function () {
	return jwp.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};
//Match user entered password
lobbySchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model('Lobby', lobbySchema);
