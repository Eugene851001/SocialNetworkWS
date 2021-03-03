const NEED_LOG_IN = 'You need to log in';
const OPEN_MODE = 0o666;
const fs = require('fs')
const crypto = require('crypto')

const Post = require('../models/post');
const User = require('../models/user');

exports.createPost = function(userData, socket, clientsOnline) {
  let date = new Date();

  let userId = socket.userId;
  userData.filename = crypto.createHash('sha256').update(userData.filename).digest('hex');
  let post = new Post({
    date: date,
	description: userData.description, 
    author: userId, 
    image: userData.filename
  });

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
  
  post.save(function(err, post) {
    if (err) {
	  console.log(err);
	} else {

	  let postToSend = {
	    postId: post._id,
		myPost: post.author._id == userId,
	    authorName: post.authorName,
	    description: post.description,
	    date: post.date,
	    photo: "uploads/" + post.image,
		likes: post.likes.length,
		like: post.likes.indexOf(userId) != -1  
 	  }

	  socket.emit('post:create', postToSend);

	  User.findById(userId, function(err, user) {
        if (err) {
		  console.log(err);
		  return;
		}
        
		postToSend.myPost = false;
		for (let [socketId, clientId] of clientsOnline) {
		  if (user.followers.indexOf(clientId) != -1) {
		    console.log('Send notification');
			socket.to(socketId).emit('post:create', postToSend);
		  }
		}
	  })
	}
  });
}

exports.delete = function(userData, socket) {
  
  let postId = userData.postId;
  let userId = socket.userId;

  Post.findOne({_id: postId})
    .populate('author')
	.exec(function(err, post){
	  if (err) {
		  console.log(err);
		  return;
	  }
 
	  if (!post) {
		  console.log('Can not find post');
		  return;
	  }
      
	  console.log(post.author);
	  if (post.author._id != userId) {
		console.log(`${post.author._id}-${userId}`);
	    return;
	  }

      Post.deleteOne({_id: postId}, function(err, result) {
		  if (err) {
			  console.log(err);
			  return;
		  }

		  console.log(result);
		  socket.broadcast.emit('post:delete', {postId: postId});
	  })
  })
}

exports.like = function(userData, socket) {
  console.log('Try to set like');
  let userId = socket.userId
  if (!userId) {
    socket.emit('post:like', {err: NEED_LOG_IN});
	return;
  }
  
  let postId = userData.postId
  Post.findOne({_id: postId}, function(err, post){
    if (err || !post) {
	  socket.emit({err: 'Post bot found'});
	  return;
	}
	
	for (let i = 0; i < post.likes.length; i++) {
	  if (post.likes[i] == userId) {
	    socket.emit({err: 'You already liked'});
        return;
	  }		  
	}
	
	post.likes.push(userId);
	console.log(post.likes.length);
	Post.findOneAndUpdate({_id: postId}, {likes: post.likes}, {new: true}, function(err, post){
	  if (err) {
	    console.log(err);
		return;
	  } 

	  let postToSend = {
		  postId: post._id,
		  authorName: post.authorName,
		  description: post.description,
		  date: post.date,
		  photo: "uploads/" + post.image,
		  likes: post.likes.length,
		  like: post.likes.indexOf(userId) != -1  
		};
	  socket.emit('post:like', {post: postToSend});
	  socket.broadcast.emit('post:update', {post: postToSend});
	});
  });
}

exports.unlike = function(userData, socket) {

	let postId = userData.postId;
	let userId = socket.userId
	Post.findById(postId, function(err, post){
		if (err) {
			console.log(err);
			socket.emit('post:unlike', {err: 'Error'})
			return;
		}
 
        if (post.likes.indexOf(userId) === -1) {
          socket.emit('post:unlike', {err: 'You did not like this post'});
		  return;
		}       
		
		let likes = post.likes;
		likes.splice(likes.indexOf(userId), 1);
		Post.findOneAndUpdate({_id: postId}, {likes: likes}, {new: true}, function(err, post){
			if (err) {
				console.log(err);
				socket.emit('post:unlike', {err: 'Error'});
				return;
			}
			
			let postToSend = {
				postId: post._id,
				authorName: post.authorName,
				description: post.description,
				date: post.date,
				photo: "uploads/" + post.image,
				likes: post.likes.length,
				like: post.likes.indexOf(userId) != -1  
			}
			socket.emit('post:unlike', {post: postToSend});
			socket.broadcast.emit('post:update', {post: postToSend});
		})
	});
}

function showPosts(socket) {
  console.log('Try to get posts');
  let userId = socket.userId
  if (!userId) {
    socket.emit('posts', {err: 'Please, log in'})
	return;
  }
  
  User.findById(userId, function(err, user){
    if (err) {
	  console.log(err);
	  socket.emit('posts', {err: 'not found'});
	  return;
	}
	
	user.following.push(userId);
	Post.find({author: { $in: user.following}}).
	  populate('author').
	  sort({date: -1}).
	  exec(function(err, posts){
	    if (err) {
	      console.log(err);
	      socket.emit('posts', {err: 'Error'})
        } else {
		  let postsToSend = posts.map( post => {
			  return {
				  postId: post._id,
				  authorName: post.author.name,
				  myPost: post.author._id == userId,
				  description: post.description,
				  date: post.date,
				  photo: 'uploads/' + post.image,
				  likes: post.likes.length,
				  like: post.likes.indexOf(userId) != -1
				}
		  })
		  socket.emit('posts', {posts: postsToSend});
	    }
	  });
  });  
}

exports.showPosts = function(socket) {
  showPosts(socket);
}