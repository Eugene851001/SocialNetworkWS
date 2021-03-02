const user = require('../controllers/user');
const {requireToken} = require('../controllers/auth') 

module.exports = (io, socket, clients) => {

    socket.on('users', () => {
        console.log('Give users');
        user.showUsers(socket, clients);
    })

    socket.on('user:get', (userData) => {
        requireToken(socket, userData, () => {
            console.log('Get user');
            user.getUser(userData, socket, clients);
        })
    })

    socket.on('user:follow', (userData) => {
        requireToken(socket, userData, ()=> {
            console.log('Follow user');
            user.addFollower(userData, socket);
            user.addFollowing(userData, socket);
        })
    })

    socket.on('user:unfollow', (userData) => {
        requireToken(socket, userData, () => {
            console.log('Unfollow user');
            user.removeFollower(userData, socket);
            user.removeFollowing(userData, socket);
        })
    })

    socket.on('user:followers', (userData) => {
            console.log('Get followers');
            user.getFollowers(userData, socket);
    })

    socket.on('user:followers', (userData) => {
            console.log('Get following');
            user.getFollowing(userData, socket);
    })

    socket.on('user:editPhoto', (userData) => {[
        requireToken(socket, userData, () => {
            console.log('Edit photo');
            user.editPhoto(userData, socket);
        })
    ]})
}