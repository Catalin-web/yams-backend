/** @format */

const ErrorResponse = require('../utils/errorResponse');

/** @format */
const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;
	console.log(err);
	if (err.name === 'CastError') {
		const message = `Resource not found`;
		error = new ErrorResponse(message, 404);
	}
	//Mongoose dublicate key
	if (err.code == 11000) {
		const message = 'Dublicate field value entered';
		error = new ErrorResponse(message, 400);
	}
	//Validation error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}
	res.status(error.statusCode || 500).json({
		succes: false,
		error: error.message || 'Server Error',
	});
};
module.exports = errorHandler;
