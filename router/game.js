/** @format */

const express = require('express');
const router = express.Router({ mergeParams: true });
const {
	createGame,
	getGame,
	updateGame,
	deleteGame,
} = require('../controller/game');
const { protect } = require('../middleware/auth');
router.route('/create').post(protect, createGame);
router.route('/get').get(protect, getGame);
router.route('/update').put(protect, updateGame);
router.route('/delete').delete(protect, deleteGame);
module.exports = router;
