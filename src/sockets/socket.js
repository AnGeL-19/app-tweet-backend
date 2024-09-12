const { Server } = require('socket.io');
const jwt =  require('jsonwebtoken');

const { validationJWTSocket } = require('../middlewares/validate-jwt');
const { connectUser } = require('../controllers/connectController');
const { sendMessage, joinChats } = require('../controllers/chatController');

class SocketConfig {
    // 
    constructor( server ){
        this.io = new Server(server, {
            cors: {
                origin: ['https://tweet-app-ashy.vercel.app', 'http://localhost:5173'],
                credentials: true
            }
        });
        this.middlewares()
    }

    middlewares(){
        this.io.use(validationJWTSocket);
    }

    connection(){
        // console.log(this.io);
        
        this.io.on('connection', (socket) => {

            socket.join(`notification_user_${socket.userId}`);

            // socket.join('66df3b15c852f594face952a');

            joinChats(socket, socket.userId)

            socket.on('connect-users', (obj) => {


                // const userId = socket.obj.from;
                connectUser(socket, obj)

                // Enviar una notificación de ejemplo
               

            });



            socket.on('sendMessage', (obj) => {

                sendMessage(socket, obj)
                // socket.to('66df3b15c852f594face952a').emit('receiveMessage', obj.message);

                // socket.emit('chat to', msg)
                // console.log('message from: ' + msg);
            });

            socket.on('disconnect', () => {
              console.log('user disconnected');
            });

        });
    }

}

module.exports = SocketConfig;