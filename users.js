/** @format */

const users = [];
const addUser = ({ name, room }) => {
	const user = { name, room };
	if (!users.find((a) => a.name === name && a.room === room))
		users.push(user);
	return users;
};
const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if (index !== -1) return users.splice(index, 1)[0];
};
const getUser = (id) => {
	return users.find((user) => user.id == id);
};
const getUsersInRoom = (room) => {
	return users.filter((user) => user.room === room);
};
module.exports = { addUser, removeUser, getUser, getUsersInRoom };
