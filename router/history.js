/** @format */

const express = require('express');
const router = express.Router({ mergeParams: true });
const { create, getLast, getAll } = require('../controller/history');
const { protect } = require('../middleware/auth');
router.route('/create').post(protect, create);
router.route('/get').get(protect, getLast);
router.route('/getAll').get(protect, getAll);

module.exports = router;
