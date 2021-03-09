/** @format */
const mongoose = require('mongoose');
const jwp = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Please enter a valid email',
		],
	},
	username: {
		type: String,
		required: [true, 'Please add an username'],
		unique: true,
	},
	role: {
		type: String,
		enum: ['user'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		minlength: 6,
		select: false,
	},
	resetPasswordToken: {
		type: String,
	},
	resetPasswordExpire: {
		type: Date,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
//Encrypt
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});
/// Get token response method
userSchema.methods.getSignedJwtToken = function () {
	return jwp.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};
//Match user entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};
/// get Token
userSchema.methods.getResetPasswordToken = function () {
	//Generate
	const resetToken = crypto.randomBytes(20).toString('hex');
	// Hash the token amd set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// this.resetPasswordToken = resetToken;
	//Set expire
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
	return resetToken;
};
module.exports = mongoose.model('User', userSchema);
