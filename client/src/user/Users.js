import React, {Component} from 'react'
import User from './User'
import Nav from '../Nav'
import Header from '../Header'
import Footer from '../Footer'
import socket from '../socket'
import Cookies from 'js-cookie'

class Users extends Component {
  	
  constructor() {
    super();
	this.state = {
	  users: []
	}
  }	  
  
  
  componentDidMount() { 
	let token = Cookies.get('token')
	socket.on('users', (response) => {
	  this.setState({users: response.users})
	})
	socket.emit('users', {token: token});
  }

  componentWillUnmount() {
	  socket.removeAllListeners('users');
  }
  
  render() {
	return (
      <div className="grid-container">
	    <Header title={{name: "Пользователи"}}/>
	    <Nav/>
	    <article>
			{this.state.users?.map((user) => {return <User user={user} key={user.userId}/>})}
		</article>
		<Footer/>
	  </div>
    );
  }
}

export default Users