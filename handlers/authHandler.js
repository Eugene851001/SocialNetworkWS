const auth = require('../controllers/auth')

module.exports = (io, socket, clients) => {

  socket.on('auth:signin', (userData) => {
    console.log('Sign in');
    console.log(userData);
    auth.signin(userData, socket);
  })

  socket.on('auth:signup', (userData) => {
      console.log('Sign up');
      auth.signup(userData, socket);
  })

  socket.on('auth:signout', () => {
      console.log('Sign out');
      auth.signout(socket, clients);
  })

}