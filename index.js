require('dotenv').config();

const Server = require('./src/server/server');

const server = new Server();

server.execute();
