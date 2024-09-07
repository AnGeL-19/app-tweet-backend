const { Server } = require('socket.io');

class SocketConfig {
    // 
    constructor( server ){
        this.io = new Server(server, {
            cors: {
                origin: ['https://tweet-app-ashy.vercel.app', 'http://localhost:5173/']
            }
        });
    }

    connection(){
        // console.log(this.io);
        
        this.io.on('connection', (socket) => {
            console.log('a user connected');

            socket.on('chat message', (msg) => {
                console.log('message: ' + msg);
            });

            socket.on('disconnect', () => {
              console.log('user disconnected');
            });

        });
    }

}

module.exports = SocketConfig;