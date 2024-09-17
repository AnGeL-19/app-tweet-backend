const { Server } = require('socket.io');

const { validationJWTSocket } = require('../middlewares/validate-jwt');
const { sendMessage, joinChats } = require('../controllers/chatController');

class SocketConfig {
    // 
    constructor( server ){
        this.io = new Server(server, {
            cors: {
                origin: ['https://tweet-app-ashy.vercel.app', 'http://localhost:5173'],
                methods: ['GET', 'POST'], // Asegúrate de especificar los métodos
                allowedHeaders: ['authorization'], // Añade los headers necesarios
                credentials: true,
            }
        });
        this.middlewares()
    }

    middlewares(){
        this.io.use(validationJWTSocket);
    }

    connection(){
        
        this.io.on('connection', (socket) => {

            console.log('CONNECT ',socket.userId);
            

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