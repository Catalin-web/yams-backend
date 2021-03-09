/** @format */

const express = require('express');
const router = express.Router({ mergeParams: true });
const {
	registerLobby,
	getLobby,
	loginLobby,
	deleteLobby,
	addUser,
	deleteUser,
	kickUser,
	toggleReady,
} = require('../controller/lobby');
const { protect } = require('../middleware/auth');
router.route('/register').post(protect, registerLobby);
router.route('/login').post(protect, loginLobby);
router.route('/mylobby').get(protect, getLobby);
router.route('/delete').delete(protect, deleteLobby);
router.route('/addUser').put(protect, addUser);
router.route('/deleteUser').put(protect, deleteUser);
router.route('/kickUser').put(protect, kickUser);
router.route('/toggleReady').put(protect, toggleReady);
module.exports = router;
