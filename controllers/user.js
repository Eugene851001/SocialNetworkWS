const User = require('../models/user');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs')

const OPEN_MODE = 0o666
const NEED_LOG_IN = 'You need to log in';

exports.editPhoto = function(userData, socket) {  
  
  userData.filename = crypto.createHash('sha256').update(userData.filename).digest('hex');
  let filename = __dirname + '/../public/uploads/' + userData.filename
  fs.open(filename, 'w', OPEN_MODE, (err, fd) => {
    if (err) {
	  console.log(err);
	   return;
	  }
  
    fs.writeFile(fd, userData.filedata, () => {
      fs.close(fd, () => {console.log('Success')});
	})
  })

  User.updateOne({_id: socket.userId}, {photo: userData.filename}, function(err, result){
    if (err) {
	  console.log(err);
	} else {
	  console.log(result);
	  User.find({_id: socket.userId}, function(err, user){
		if (err) {
		  console.log('Error');
		  return;
		}
		
		if (!user) {
		  console.log('User not found');
		  return;
		}
		
		socket.emit('user:editPhoto', {photo: '../uploads/' + userData.filename});
	  });
	}
  });
}

exports.getUser = function(userData, socket, clientsOnline) {
  console.log('Getting user');

  let profileId = userData.userId;
  if (profileId == 'me') {
	  profileId = socket.userId;
  }

  let userId = socket.userId;
  User.findById(profileId)
	.exec(function(err, user){
      if (err) {
	    console.log(err);
	    return;
	  }
	
	  if (!user) {
	    return;
	  }
	
      let signed = user.followers.indexOf(mongoose.Types.ObjectId(userId)) != -1;
	  let myProfile = profileId === userId;
	  socket.emit('user:get', {
		myProfile: myProfile,
		signed: signed,
		photo: '../uploads/' + user.photo,
		name: user.name,
		online: hasUser(clientsOnline.values(), profileId)
	  });
  });
}

exports.showUsers = function(socket, clientsOnline) {
  User.find({}, function(err, users){
	if (err) {
	  console.log(err);
	  return;
	}
	
	
	let usersToSend = users.map((user) => {
	  return {
	    name: user.name,
        photo: "uploads/" + user.photo,
        userId: user._id,
		online: hasUser(clientsOnline.values(), user._id)
	  }
	});
	socket.emit('users', {users: usersToSend});
  });
}

function hasUser(users, id) {
  for (let userId of users) {
	  if (userId == id) {
		  return true;
	  }
  }

  return false;
}

exports.getFollowing = function(userData, socket) {
  let userId = userData.userId;
  if (userId == 'me') {
    userId = socket.userId;
  }

  console.log('Try get following');
  User.findOne({_id: userId}, function(err, user){
	if (err) {
	  console.log(err);
	  return;
	}
	
    User.find({_id: { $in: user.following}}, function(err, users){
	  let usersToSend = users.map((user) => {
	    return {
		  name: user.name,
		  photo: "../uploads/" + user.photo,
		  userId: user._id
		}
	  });
	  socket.emit('user:following', {users: usersToSend});   
	});
  });
}

exports.getFollowers = function(userData, socket) {
  let userId = userData.userId;  
  if (userId == 'me') {
    userId = socket.userId;
  }

  console.log('Try get followers');
  User.findById(userId, function(err, user){
	if (!user) {
		console.log('Not found');
		return;
	}

    User.find({_id: { $in: user.followers}}, function(err, users){
	  let usersToSend = users.map((user) => {
	    return {
		  name: user.name,
		  photo: "../uploads/" + user.photo,
		  userId: user._id
		}
	  });
	  socket.emit('user:followers', {users: usersToSend});
	});
  });
}

exports.addFollowing = function(userData, socket) {

  let userId = userData.userId;
  

  User.findOne({_id: socket.userId}, function(err, user){
    if (err) {
	  console.log(err);
	  return;
	}
	
	if (!user) {
	  console.log('Not found');
	  return;
	}
	
	if (user.following.indexOf(mongoose.Types.ObjectId(userId)) != -1) {
	  console.log({err: 'Already follow'});
	  return;
	}
	
	let following = user.following;
	following.push(userId);
	User.findOneAndUpdate({_id: socket.userId}, {following: following}, {new: true}, function(err, user){
	  if (err) {
	    console.log(err);
		return;
	  }
	  
	  socket.emit('user:follow', {follow: true});
	});
  });
}

exports.removeFollowing = function(userData, socket) {

  let userId = userData.userId;
  User.findByIdAndUpdate(socket.userId, {$pull: {following: userId}}, {new: true})
    .exec(function(err, user){
	  if (err) {
		  console.log(err);
	  }
	  
	  socket.emit('user:unfollow', {follow: false})
	});  
}

exports.addFollower = function(userData, socket) {
  
  let userId = userData.userId;
  User.findByIdAndUpdate(userId, {$push: {followers: socket.userId}})
    .exec(function(err, user){
	  if (err) {
	    console.log(err);
		return;
	  }
	});
}

exports.removeFollower = function(userData, socket) {
  
  let userId = userData.userId;
  User.findByIdAndUpdate(userId, {$pull: {followers: socket.userId}})
    .exec(function(err, user){
	  if (err) {
	    console.log(err);
		return;
	  }
	  
	});
}
