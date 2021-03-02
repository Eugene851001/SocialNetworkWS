const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signout = (socket, clientsOnline) => {
  console.log('Signed out');
  if (clientsOnline.has(socket.id)) {
    clientsOnline.delete(socket.id);
  }

  response.json();
}

exports.signup = (userData, socket) => {
  User.findOne({login: userData.login}, function(err, user) {
    if (err) {
	    console.log(err);
		  return;
	  }
	  
	  if (user) {
      socket.emit('auth:signup', {err: 'Please, choose another login'});
		  return;
	  }
	  
	  user = new User(userData);
      user.save(function(err){
      if (err) {
	      console.log(err);
	    } else {
	      authorize(socket, user, 'auth:signup');
	    }
    }); 
  });
}

exports.signin = (userData, socket) => {
  let {login, password} = userData;
  User.findOne({login, password}, function(err, user){
    if (err || !user) {
	    console.log('User not found');
      socket.emit('auth:signup', {err: 'User not found'});
	  } else {
	    authorize(socket, user, 'auth:signin');
	  }
  });
}

function authorize(socket, user, message) {
	let token = jwt.sign({userId: user._id}, process.env.JWT_KEY);
  socket.emit(message, {token: token, userId: user._id})
}

exports.requireSignin = (request, response, next) => {
  if (request.cookies.userId) {
    next();
  } else {
    response.status(401).json({err: 'Please, log in'});
  }
}

exports.requireToken = (socket, userData, next) => {
  let token = userData?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) {
        console.log(err);
        return;
      }

      socket.userId = payload.userId;
      console.log(socket.userId)
      next();
    })
  } 
}