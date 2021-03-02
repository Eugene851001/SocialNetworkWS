const post = require('../controllers/post')
const {requireToken} = require('../controllers/auth') 

module.exports = (io, socket, clients) => {

    socket.on('posts', (userData) => {
        requireToken(socket, userData, () => {
            console.log('Give posts');
            post.showPosts(socket);
        })
    })

    socket.on('post:like', (userData) => {
        requireToken(socket, userData, () =>{
            console.log('Like post');
            post.like(userData, socket);
        })
    })

    socket.on('post:unlike', (userData) => {
        requireToken(socket, userData, () => {
            console.log('Unlike post');
            post.unlike(userData, socket);
        })
    })

    socket.on('post:delete', (userData) => {
        requireToken(socket, userData, () => {
            console.log('Delete post');
            post.delete(userData, socket);
        })
    })

    socket.on('post:create', (userData) => {
        requireToken(socket, userData, () => {
            console.log('Create post');
            post.createPost(userData, socket, clients);
        })
    })
}