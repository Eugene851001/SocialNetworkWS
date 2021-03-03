import React, {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect} from 'react-router-dom'
import socket from '../socket'

class Post extends Component {

  constructor(props) {
    super();
	this.state = {
	  postId: props.post.postId,
	  authorName: props.post.authorName,
	  myPost: props.post.myPost,
	  description: props.post.description,
	  date: props.post.date,
	  photo: props.post.photo,
	  likes: props.post.likes,
	  like: props.post.like,
	  redirect: false,
	  redirectToLogination: false,
	}
	
	this.onLike = this.onLike.bind(this);
	this.onUnlike = this.onUnlike.bind(this);
	this.onDelete = this.onDelete.bind(this);
  }
  
  onLike(e) {
    e.preventDefault();

	if (this.state.like) {
	  return;
	}
	
	let token = Cookies.get('token')
	socket.emit('post:like', {postId: this.state.postId, token: token});
  }

  onUnlike(e) {
    e.preventDefault();

	if (!this.state.like) {
		return;
	}

	let token = Cookies.get('token');
	socket.emit('post:unlike', {postId: this.state.postId, token: token});
  }

  onDelete(e) {
    e.preventDefault();
    
	let token = Cookies.get('token');
	socket.emit('post:delete', {postId: this.state.postId, token: token});
	this.setState({redirect: true});
  }

  componentDidMount() {
    socket.on('post:update', (response) => {
		console.log(response);
		if (response.post.postId != this.state.postId) {
		  return;
		}

		this.setState({
			likes: response.post.likes
		})
	})

	socket.on('post:delete', (response) => {
		console.log(response);

		if (response.postId == this.state.postId) {
			this.setState({redirect: true});
		}
	})

	socket.on('post:unlike', (response) => {
		if (response.err) {
			this.setState({redirectToLogination: true})
			return
		  }
		  
		  this.setState({
			likes: response.post.likes,
			like: response.post.like,
		  });
	})

	socket.on('post:like', (response) => {
		console.log(response);
		if (response.err) {
			this.setState({redirectToLogination: true})
			return
		}
  
		if (response.post.postId == this.state.postId) {
			this.setState({
				likes: response.post.likes,
				like: response.post.like,
			});
		}
	})

	socket.on('error:401', () => {
	  this.setState({redirectToLogination: true});
	})

  }

  componentWillUnmount() {
    socket.removeAllListeners('post:delete');
	socket.removeAllListeners('post:update');
	socket.removeAllListeners('post:like');
	socket.removeAllListeners('post:unlike');
	socket.removeAllListeners('error:401');
  }
  
  render() {
	let {authorName, description, date, likes, photo, myPost} = this.state;
	const buttonLike = <button className="button-like" onClick={this.onLike}>Likes {likes}</button>;
	const buttonUnlike = <button className="button-unlike" onClick={this.onUnlike}>Likes {likes}</button>;
	const buttonDelete = <button onClick={this.onDelete}>Удалить</button>;
	let objDate = new Date(date);
	const body = <div className="post">
					<p><h3>{authorName}</h3></p>
					<p>{description}</p>
					<p>{`${objDate.getDate()}-${objDate.getMonth() + 1}-${objDate.getFullYear()}`}</p>
					<img className ="post-image" src={photo} width="480" height="320" />
					<p>
						{this.state.like ? buttonUnlike : buttonLike}
						{myPost ? buttonDelete : ''}
					</p>
				</div>;
    return (
      <div>
		  {this.state.redirectToLogination ? <Redirect to="/Logination"/> : ''}
		  {this.state.redirect ? '' : body}
	  </div>
    );
  }
  
}

export default Post;