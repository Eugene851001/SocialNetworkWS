import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import socket from '../socket'

class User extends Component {

  constructor(props) {
    super();
    console.log(props);
    this.state = {
      user: props.user
    }
  }

  componentDidMount() {
    socket.on('user:update', (response) => {
      console.log(response);
      if (response.userId == this.state.user.userId) {
        this.state.user.online = response.online;
        this.setState({user: this.state.user})
      }
    })
  }

  componentWillUnmount() {
    socket.removeAllListeners('user:update');
  }

  render() {
    let {user} = this.state;
    return (
      <div>
      <img src={user.photo} width="32" height="32"/>
      <Link to={"/Profile/" + user.userId}>{user.name}</Link>
      {user.online ? 'Онлайн' : 'Не в сети'}
    </div>
    );
  }
}

export default User;