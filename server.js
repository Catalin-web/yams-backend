/** @format */
const express = require('express');
const dotenv = require('dotenv');
var cors = require('cors');
/// .env configuration
const socketio = require('socket.io');
const http = require('http');
dotenv.config({ path: './config/config.env' });
const colors = require('colors');
const connectDB = require('./config/db');
//ROUTER
const auth = require('./router/auth');
const lobby = require('./router/lobby');
const game = require('./router/game');
const history = require('./router/history');
/// Application
connectDB();
const cookieParser = require('cookie-parser');
//Error handling
const errorHandler = require('./middleware/error');
const app = express();
app.use(
	cors({
		credentials: true,
		origin: 'https://yamsonline.netlify.app',
		// origin: 'http://localhost:3000',
		exposedHeaders: ['token', 'room'],
	}),
);
app.use(function (req, res, next) {
	res.setHeader(
		'Access-Control-Allow-Origin',
		'https://yamsonline.netlify.app',
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE',
	);
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-Requested-With,content-type',
	);
	res.setHeader('Access-Control-Allow-Credentials', true);

	next();
});
app.use(express.json());
app.enable('trust proxy');
app.use(cookieParser());
const PORT = process.env.PORT || 5000;
const PORT2 = 3000;
/// !!! Applying the routes !!! ///

app.use('/api/v1/yams_online/auth', auth);
app.use('/api/v1/yams_online/lobby', lobby);
app.use('/api/v1/yams_online/game', game);
app.use('/api/v1/yams_online/history', history);
app.get('/', (req, res) => {
	res.status(200).send('Server is up and running');
});
// app.set('view engine', 'ejs');
app.use(errorHandler);
///SOCKET.IO !!!!!!!!!!!!!!!!!!
const server = http.createServer(app);
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./users');
const io = socketio(server);
const users = {};

const socketToRoom = {};
io.on('connection', (socket) => {
	socket.on('join', ({ name, room }, callback) => {
		socket.to(room).emit('joinlobby', {
			user: 'admin',
			text: `${name}, has joined`,
			username: name,
		});
		socket.join(room);

		callback();
	});
	socket.on('kick', ({ username, room }) => {
		socket.to(room).emit('leave', {
			text: `${username}, has left`,
			username,
		});
	});
	socket.on('ready', ({ name, room }) => {
		socket.to(room).emit('ready', {
			name,
		});
	});
	socket.on('start', ({ room }) => {
		socket.to(room).emit('start');
	});
	socket.on('joinRoom', ({ room, name }) => {
		socket.join(room);
		socket.to(room).emit('message', {
			username: 'admin',
			text: `${name} has joined`,
		});
	});
	socket.on('message', ({ username, text, room }) => {
		socket.to(room).emit('message', { username, text });
	});
	socket.on('startGame', ({ room, username }) => {
		socket.broadcast.to(room).emit('startGame', { username });
	});
	socket.on('rolled', ({ room, arr }) => {
		socket.to(room).emit('rolled', { arr });
	});
	socket.on('next', ({ username, type, where, x, room, from }) => {
		// console.log(username, room, type, where, x, from);
		socket
			.to(room)
			.emit('next', { username, room, type, where, x, from });
	});
	socket.on('final', ({ type, where, x, room, from }) => {
		console.log(room, type, where, x, from);
		socket.to(room).emit('final', { room, type, where, x, from });
	});
	socket.on('Join Game', ({ room }) => {
		socket.join(room);
	});
	///!!PEERS
	socket.on('join room', (roomID) => {
		if (users[roomID]) {
			const length = users[roomID].length;
			users[roomID].push(socket.id);
		} else {
			users[roomID] = [socket.id];
		}
		socketToRoom[socket.id] = roomID;
		const usersInThisRoom = users[roomID].filter(
			(id) => id !== socket.id,
		);

		socket.emit('all users', usersInThisRoom);
	});

	socket.on('sending signal', (payload) => {
		io.to(payload.userToSignal).emit('user joined', {
			signal: payload.signal,
			callerID: payload.callerID,
		});
	});

	socket.on('returning signal', (payload) => {
		io.to(payload.callerID).emit('receiving returned signal', {
			signal: payload.signal,
			id: socket.id,
		});
	});
	///!!PEERS
	socket.on('Voice chat leave', ({ room, id: name }) => {
		const roomID = socketToRoom[socket.id];
		let room2 = users[roomID];
		if (room2) {
			room2 = room2.filter((id) => id !== socket.id);
			users[roomID] = room2;
		}
		socket.to(room).broadcast.emit('Voice chat leave', { id: name });
	});
	socket.on('dissconnect', ({ name, room }) => {
		socket.to(room).broadcast.emit('user left', { name });
		const roomID = socketToRoom[socket.id];
		let room2 = users[roomID];
		if (room2) {
			room2 = room2.filter((id) => id !== socket.id);
			users[roomID] = room2;
		}
		socket.broadcast.to(room).emit('leave', {
			text: `${name}, has left`,
			username: name,
		});
	});
});
///!!!!!!!!!!!!!!!!!!!!!!!!!!!
/// Listening on port 5000
server.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
			.yellow.bold,
	),
);
//Handle unhandle rejections
process.on('unhandledRejection', (error, promise) => {
	console.log(`Error: ${error.message}`.red);
	//close server and exit process
	server.close(() => {
		process.exit(1);
	});
});
