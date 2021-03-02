import openSocket from 'socket.io-client'
const END_POINT = 'ws://localhost:3000';

const socket = openSocket(END_POINT);

export default socket;