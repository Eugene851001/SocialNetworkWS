import React, {Component} from 'react'
import Post from './Post'
import Nav from '../Nav'
import Header from '../Header'
import Footer from '../Footer'
import {Redirect} from 'react-router-dom'
import socket from '../socket'
import Cookies from 'js-cookie'

class Posts extends Component {

    constructor() {
        super();

        this.state = {
            posts: [],
			redirect: false,
        }
		
		this.onSubmit = this.onSubmit.bind(this);
		this.onChangeFile = this.onChangeFile.bind(this);
		this.onChangeText = this.onChangeText.bind(this);
    }
	
	onSubmit(e) {
	  e.preventDefault();

	  let reader = new FileReader();
	  reader.readAsArrayBuffer(this.filedata);
	  reader.onload = () => {
        let token = Cookies.get('token')
		socket.emit('post:create', {
			token: token, 
			filedata: reader.result, 
			filename: this.filedata.name,
			description: this.description 
		});
	  }
	}
	
	onChangeFile(e) {
	  	this.filedata = e.target.files[0];
	}
	
	onChangeText(e) {
	  this.description = e.target.value;
	}

    componentDidMount() {
	  let token = Cookies.get('token')
      socket.on('posts', (response) => {
	    if (response.err) {
			console.log(response.err)
			return
		}

		this.setState({posts: response.posts})
	  })

	  socket.on('post:create', (response) => {
		this.state.posts.unshift(response);
	    this.setState({posts: this.state.posts});
	  })

	  socket.on('error:401', () => {
	    this.setState({redirect: true}); 
	  })

	  socket.emit('posts', {token: token})
    }

	componentWillUnmount() {
		socket.removeAllListeners('posts');
		socket.removeAllListeners('post:create');
		socket.removeAllListeners('error:401');
	}

    render(){
      return (
        <div className="grid-container">
			{this.state.redirect ? <Redirect to="/Logination"/> : ''}
			<Header title={{name: "Посты"}}/>
			<Nav/>
			<article>
				<form action="create" encType="multipart/form-data" className="add-post-form">
					<input type="text" name="description" onChange={this.onChangeText}/><br/>
					<input type="file" name="filedata" onChange={this.onChangeFile} required/><br/>
					<input type="submit" value="Добавить" onClick={this.onSubmit}/>
				</form>
				{this.state.posts.map((post) => {return <div><Post post={post} key={post.postId}/></div>})}
			</article>
			<Footer />
        </div>
      );    
    }
}

export default Posts;