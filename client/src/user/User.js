import React, {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import socket from '../socket'

function User(props) {
  let [user, setUser] = useState(props.user)

  useEffect(() => {
    socket.on('user:update', (response) => {
      console.log(response);
      if (response.userId == user.userId) {
        user.online = response.online;
        console.log(user);
        setUser(user);
      }
    })

    return () => {socket.removeAllListeners('user:update')}
  })

  return (
    <div>
	  <img src={user.photo} width="32" height="32"/>
	  <Link to={"/Profile/" + user.userId}>{user.name}</Link>
    {user.online ? 'Онлайн' : 'Не в сети'}
	</div>
  );
}

export default User;