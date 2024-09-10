const { Server } = require('socket.io');
const jwt =  require('jsonwebtoken');
const { connectUser } = require('../controllers/chatController');
const { validationJWTSocket } = require('../middlewares/validate-jwt');

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
            console.log('a user connected', socket.userId);

            socket.on('connect-users', (obj) => {


                // const userId = socket.obj.from;
                connectUser(socket, obj)

                // Enviar una notificación de ejemplo
                

            });


            socket.on('connect-user', (obj) => {
                // va mandar el usuario y buscara sus coxiones
            });

            socket.on('chat from', (msg) => {

                socket.emit('chat to', msg)
                console.log('message from: ' + msg);
            });

            socket.on('disconnect', () => {
              console.log('user disconnected');
            });

        });
    }

}

module.exports = SocketConfig;