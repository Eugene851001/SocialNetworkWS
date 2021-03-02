import React, {Component} from 'react'
import User from './User'
import Nav from '../Nav'
import Header from '../Header'
import Footer from '../Footer'
import socket from '../socket'

class Following extends Component {
  	
  constructor() {
    super();
	this.state = {
	  users: []
	}
  }	  
  
  
  componentDidMount() {
	socket.on('user:following', (response) => {
	  alert('response');
	  this.setState({users: response.users});
	});
  
	this.state.userId = this.props.match.params.userId;
	socket.emit('user:following', {userId: this.state.userId});
  }

  componentWillUnmount() {
    socket.removeAllListeners('user:following');
  }

  render() {
	return (
      <div className="grid-container">
	    <Header title={{name: "Подписки"}}/>
	    <Nav/>
	    <article>
			{this.state.users.map((user) => {return <User user={user}/>})}
		</article>
		<Footer/>
	  </div>
    );
  }
}

export default Following