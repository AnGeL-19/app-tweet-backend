const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors =  require('cors');
// const Sockets = require('./sockets');

// const { dbConnection } = require('../database/config');
const fileUpload = require('express-fileupload');
const { dbConnection } = require('../db/configuration');


class Server{

    constructor(){

        this.app = express();
        this.port = process.env.PORT || 8080;

        // connection DB
        dbConnection();

        // http server
        
        this.server = http.createServer(this.app);
        

        // configuration sockets
        this.io = socketio( this.server );

        // middlewares
        this.middlewares();

        // initialize sockets
        // this.configurationSockets();

        //routers api
        this.routers();

    }

    corsOptionsDelegate (req, callback) {
        let allowlist = ['https://app-tweeter-front.vercel.app', 'http://localhost:5173']

        let corsOptions;

        // console.log(allowlist.indexOf(req.header('Origin')) !== -1);
        // console.log(req.header('Origin'));
        if (allowlist.indexOf(req.header('Origin')) !== -1) {
          corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
        } else {
          corsOptions = { origin: false } // disable CORS for this request
        }
        callback(null, corsOptions) // callback expects two parameters: error and options
    }

    middlewares(){
        //public
        this.app.use(express.static('public'));

        //Cors
        this.app.use(cors(this.corsOptionsDelegate))

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

    // configurationSockets(){
    //     new Sockets(this.io);
    // }

    execute(){
        
        // initialize server
        this.server.listen(this.port, () => {
            console.log('Server running on the port', this.port);
        });
    }

}

module.exports = Server;