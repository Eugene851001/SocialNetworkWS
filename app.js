const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const {requireToken} = require('./controllers/auth') 

const registerAuthHandlers = require('./handlers/authHandler');
const registerUserHandlers = require('./handlers/userHandler');
const registerPostHandlers = require('./handlers/postHandler');


const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors: {origin: '*'}});

let clients = new Map();

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true }, function(err) {
  if (err)
    console.log(err);
  else
    console.log('connected');
});

io.on('connection', (socket) =>{
  console.log('User connected')

  socket.onAny((eventName, userData) => {
    requireToken(socket, userData, () => {
      if (!clients.has(socket.id)) {
        clients.set(socket.id, socket.userId);
        socket.broadcast.emit('user:update', {userId: socket.userId, online: true});
      }
    })
  })

  registerAuthHandlers(io, socket, clients);
  registerUserHandlers(io, socket, clients);
  registerPostHandlers(io, socket, clients);

  socket.on('disconnect', () => {
    if (clients.has(socket.id)) {
      socket.broadcast.emit('user:update', {userId: clients.get(socket.id), online: false});
      clients.delete(socket.id);
    }

    console.log(`User ${socket.id} disconnted`)
  })
})

app.use(express.static(__dirname + "/public"));

http.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
})
