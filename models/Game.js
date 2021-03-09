/** @format */
const mongoose = require('mongoose');
const User = new mongoose.Schema({
	username: {
		type: String,
		required: true,
	},
	ready: {
		type: Boolean,
		required: true,
		default: false,
	},
	stanga: {
		zar1: {
			type: Number,
			required: true,
			default: 0,
		},
		zar2: {
			type: Number,
			required: true,
			default: 0,
		},
		zar3: {
			type: Number,
			required: true,
			default: 0,
		},
		zar4: {
			type: Number,
			required: true,
			default: 0,
		},
		zar5: {
			type: Number,
			required: true,
			default: 0,
		},
		zar6: {
			type: Number,
			required: true,
			default: 0,
		},
		totalZar: {
			type: Number,
			required: true,
			default: 0,
		},
		P: {
			type: Number,
			required: true,
			default: 0,
		},
		B3: {
			type: Number,
			required: true,
			default: 0,
		},
		Q: {
			type: Number,
			required: true,
			default: 0,
		},
		F: {
			type: Number,
			required: true,
			default: 0,
		},
		K: {
			type: Number,
			required: true,
			default: 0,
		},
		Y: {
			type: Number,
			required: true,
			default: 0,
		},
		m: {
			type: Number,
			required: true,
			default: 0,
		},
		M: {
			type: Number,
			required: true,
			default: 0,
		},
		totalMari: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	mijloc: {
		zar1: {
			type: Number,
			required: true,
			default: 0,
		},
		zar2: {
			type: Number,
			required: true,
			default: 0,
		},
		zar3: {
			type: Number,
			required: true,
			default: 0,
		},
		zar4: {
			type: Number,
			required: true,
			default: 0,
		},
		zar5: {
			type: Number,
			required: true,
			default: 0,
		},
		zar6: {
			type: Number,
			required: true,
			default: 0,
		},
		totalZar: {
			type: Number,
			required: true,
			default: 0,
		},
		P: {
			type: Number,
			required: true,
			default: 0,
		},
		B3: {
			type: Number,
			required: true,
			default: 0,
		},
		Q: {
			type: Number,
			required: true,
			default: 0,
		},
		F: {
			type: Number,
			required: true,
			default: 0,
		},
		K: {
			type: Number,
			required: true,
			default: 0,
		},
		Y: {
			type: Number,
			required: true,
			default: 0,
		},
		m: {
			type: Number,
			required: true,
			default: 0,
		},
		M: {
			type: Number,
			required: true,
			default: 0,
		},
		totalMari: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	dreapta: {
		zar1: {
			type: Number,
			required: true,
			default: 0,
		},
		zar2: {
			type: Number,
			required: true,
			default: 0,
		},
		zar3: {
			type: Number,
			required: true,
			default: 0,
		},
		zar4: {
			type: Number,
			required: true,
			default: 0,
		},
		zar5: {
			type: Number,
			required: true,
			default: 0,
		},
		zar6: {
			type: Number,
			required: true,
			default: 0,
		},
		totalZar: {
			type: Number,
			required: true,
			default: 0,
		},
		P: {
			type: Number,
			required: true,
			default: 0,
		},
		B3: {
			type: Number,
			required: true,
			default: 0,
		},
		Q: {
			type: Number,
			required: true,
			default: 0,
		},
		F: {
			type: Number,
			required: true,
			default: 0,
		},
		K: {
			type: Number,
			required: true,
			default: 0,
		},
		Y: {
			type: Number,
			required: true,
			default: 0,
		},
		m: {
			type: Number,
			required: true,
			default: 0,
		},
		M: {
			type: Number,
			required: true,
			default: 0,
		},
		totalMari: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});
const gameSchema = new mongoose.Schema({
	users: {
		type: [User],
		required: true,
	},
	current: {
		type: String,
		required: true,
	},
	rolled: {
		type: Number,
		required: true,
		default: 0,
	},
	dice: [Number],
	room: {
		type: String,
		unique: true,
		required: true,
	},
});
module.exports = mongoose.model('Game', gameSchema);
