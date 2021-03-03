import React, {Component} from 'react'
import Header from '../Header'
import Footer from '../Footer'
import {Redirect} from 'react-router-dom'
import socket from '../socket'


class Registration extends Component {
  
  constructor() {
    super();
    this.state = {
      name: '',
      login: '',
      password: '',
      userId: '',
      error: '',
      signedUp: false
    };
    
    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeLogin = this.onChangeLogin.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
  }

  componentDidMount() {
    
    socket.on('auth:signup', (response) => {
      console.log(response);
      if (response.err) {
        this.setState({error: response.err});
      } else {
        document.cookie = `token=${response.token}`;
        this.setState({signedUp: true, userId: response.userId});
      }
    })
  }

  componentWillUnmount() {
    socket.removeAllListeners('auth:signup');
  }

  onChangeName(e) {
    this.setState({name: e.target.value});
  }

  onChangeLogin(e){
    this.setState({login: e.target.value});
  }

  onChangePassword(e){
    this.setState({password: e.target.value});
  }

  onSubmit(e) {
    e.preventDefault();

    let {name, login, password} = this.state;
    let user = {name, login, password};
    socket.emit('auth:signup', user);
  }

  render(){
    return (
      <div>
        <Header title={{name: "Регистрация"}}/>
        <article>
          <h2>{this.state.error}</h2>
          <h2>{this.state.signedUp ? <Redirect to={`/Profile/${this.state.userId}`}/> : ''}</h2>
          <form action="signup" method="POST" className="registration-form">
            <label>Имя</label>
            <input name="name" type="text" value={this.name}  required onChange={this.onChangeName}/><br></br>
            <label>Логин</label>
            <input name="login" type="text" value={this.login} required onChange={this.onChangeLogin} /><br></br>
            <label>Пароль</label>
            <input name="password" type="password" value={this.password} required onChange={this.onChangePassword} /><br></br>
            <input type="submit" value="Регистрация" onClick={this.onSubmit}/>
          </form>
        </article>
        <Footer />
      </div>
    );
  }
}

export default Registration;