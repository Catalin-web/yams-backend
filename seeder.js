/** @format */

const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
//env
dotenv.config({ path: './config/config.env' });
const User = require('./models/User');
const Lobby = require('./models/Lobby');
//Connect
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
});

//Import into DB
const importData = async () => {
	try {
		await User.create(users);
		console.log('Data Imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};
//Delete data

const deleteData = async () => {
	try {
		await User.deleteMany();
		await Lobby.deleteMany();
		console.log('Data destroy...'.red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};
if (process.argv[2] === '-i') {
	importData();
} else if (process.argv[2] === '-d') {
	deleteData();
}
