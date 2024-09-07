const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors =  require('cors');
const cookieParser = require('cookie-parser')

// const { dbConnection } = require('../database/config');
const fileUpload = require('express-fileupload');
const { dbConnection } = require('../db/configuration');
const SocketConfig = require('../sockets/socket');


class Server{

    

    constructor(){

        this.app = express();
        this.port = process.env.PORT || 8080;

        // connection DB
        dbConnection();

        // http server
        
        this.server = http.createServer(this.app);
        

        // middlewares
        this.middlewares();

        // initialize sockets
        this.configurationSockets();

        //routers api
        this.routers();

    }

    corsOptionsDelegate  (origin, callback) {

        const allowedOrigins = ['https://tweet-app-ashy.vercel.app', 'http://localhost:5173']

        // Permitir solicitudes sin origen (por ejemplo, desde Postman o aplicaciones móviles)
        if (!origin) return callback(null, true);
        
        // Verificar si el origen está en la lista de permitidos
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = 'El origen de la solicitud no está permitido por la política de CORS.';
          return callback(new Error(msg), false);
        }
        
        return callback(null, true);
    }


    middlewares(){

        //public
        this.app.use(express.static('public'));

        //Cookies
        this.app.use(cookieParser())

        //Cors
        this.app.use(cors({
            origin: this.corsOptionsDelegate,
            credentials: true
        }))

        // parse body
        this.app.use( express.json() );

        // Fileupload 
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));

        

    }

    routers(){
        // path api
        this.app.use('/api/auth', require('../router/authRoute'));
        this.app.use('/api/tweet', require('../router/tweetsRoute'));
        this.app.use('/api/user', require('../router/userRoute'));
        this.app.use('/api/tweets', require('../router/tweetsPeopleRoute'));
        this.app.use('/api/upload', require('../router/uploadRoute'));
    }

    configurationSockets(){
        const socketConf = new SocketConfig(this.server)
        socketConf.connection()
    }

    execute(){
        
        // initialize server
        this.server.listen(this.port, () => {
            console.log('Server running on the port', this.port);
        });
    }

}

module.exports = Server;