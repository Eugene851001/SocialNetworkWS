import React, {Component} from 'react'
import Nav from '../Nav'
import Header from '../Header'
import Footer from '../Footer'
import {Link, Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import socket from '../socket'

class Profile extends Component {

  constructor() {
    super();
    this.state = {
      myPage: false,
      follow: false,
      photo: '',
      name: '',
	    photoToSend: undefined,
      redirect: false,
    };
	
	  this.onEditPhoto = this.onEditPhoto.bind(this);
	  this.onSubmit = this.onSubmit.bind(this);
	  this.onFollow = this.onFollow.bind(this);
	  this.onUnfollow = this.onUnfollow.bind(this);
  }

  componentDidMount() {
	  this.postData = new FormData();
	  let userId = this.props.match.params.userId;
	  this.state.userId = userId;

    socket.on('user:get', (response) => {
      this.setState({
        myPage: response.myProfile, 
        follow: response.signed,
        photo: response.photo, 
        name: response.name,
        online: response.online
      })
    })

    socket.on('user:unfollow', (response) => {
      this.setState({follow: response.follow})
    })

    socket.on('user:follow', (response) => {
      this.setState({follow: response.follow})
    })
    
    socket.on('user:update', (response) => {
      this.setState({online: response.online});
    })

    socket.on('user:editPhoto', (response) => {
      this.setState({photo: response.photo});
    }) 

    let token = Cookies.get('token');
    socket.emit('user:get', {token: token, userId: userId})
  }
  
  onEditPhoto(e) {
	  this.filedata = e.target.files[0];
  }
  
  onSubmit(e) {
    e.preventDefault();

    let reader = new FileReader();
	  reader.readAsArrayBuffer(this.filedata);
	  reader.onload = () => {
      let token = Cookies.get('token')
		  socket.emit('user:editPhoto', {
			  token: token, 
			  filedata: reader.result, 
			  filename: this.filedata.name, 
		  });
	  }
  }
  
  onFollow(e) {
    e.preventDefault();

    let token = Cookies.get('token');
    socket.emit('user:follow', {token: token, userId: this.state.userId})
  }
  
  onUnfollow(e) {
    e.preventDefault();

    let token = Cookies.get('token');
    socket.emit('user:unfollow', {token: token, userId: this.state.userId})
  }

  componentWillUnmount(){
    socket.removeAllListeners('user:get');
    socket.removeAllListeners('user:unfollow');
    socket.removeAllListeners('user:follow');
    socket.removeAllListeners('user:editPhoto');
    socket.removeAllListeners('user:update');
  }

  render() {
    const editPhotoForm = <div>
            <form action="editPhoto" encType="multipart/form-data">
              <input type="file" name="filedata" onChange={this.onEditPhoto} required/><br/>
              <input type="submit" value="Изменить" onClick={this.onSubmit}/>
            </form>
          </div>;
    const followButton = <p><button onClick={this.onFollow}>Подписаться</button></p>
	  const unfollowButton = <p><button onClick={this.onUnfollow}>Отписаться</button></p>
    return (
      <div className="grid-container">
        {this.state.redirect ? <Redirect to="/Logination"/> : ''}
		    <Header title={{name: "Профиль"}}/>
	      <Nav />
		    <article>
          <table>
            <tr>
              <td>
                <img src={this.state.photo} width="320" height="240"/><br></br>
              </td>
              <td>
                {this.state.online ? 'Онлайн' : 'Не в сети'}
              </td>
            </tr>
          </table>
			    
			    {this.state.myPage ? editPhotoForm : ''}<br></br>
			    {this.state.myPage || this.state.follow ? '' : followButton }
			    {this.state.myPage || !this.state.follow ? '' : unfollowButton} 
          <table>
            <tr>
              <td><Link to={`/Following/${this.state.userId}`}>Подписки</Link></td>
              <td><Link to={`/Followers/${this.state.userId}`}>Подписчики</Link></td>
            </tr>
          </table>
			    <h2>{this.state.name}</h2>
		    </article>
		    <Footer />
      </div>
    );
  }
}

export default Profile;