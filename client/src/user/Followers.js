import React, {Component} from 'react'
import User from './User'
import Nav from '../Nav'
import Header from '../Header'
import Footer from '../Footer'
import socket from '../socket'

class Users extends Component {
  	
  constructor() {
    super();
	this.state = {
	  users: []
	}
  }	  
  
  
  componentDidMount() {
	socket.on('user:followers', (response) => {
      this.setState({users: response.users});
	});

    this.state.userId = this.props.match.params.userId;
	socket.emit('user:followers', {userId: this.state.userId});
  }

  componentWillUnmount() {
	 socket.removeAllListeners('user:followers');
  }
  
  render() {
	return (
      <div className="grid-container">
	    <Header title={{name: "Подписчики"}}/>
	    <Nav/>
	    <article>
			{this.state.users.map((user) => {return <User user={user}/>})}
		</article>
		<Footer/>
	  </div>
    );
  }
}

export default Users