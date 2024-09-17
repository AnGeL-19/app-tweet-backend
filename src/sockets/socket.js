const { Server } = require('socket.io');

const { validationJWTSocket } = require('../middlewares/validate-jwt');
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

            joinChats(socket, socket.userId)


            socket.on('sendMessage', (obj) => {

                sendMessage(socket, obj)
            });

            socket.on('disconnect', () => {
              console.log('user disconnected');
            });

        });
    }

}

module.exports = SocketConfig;