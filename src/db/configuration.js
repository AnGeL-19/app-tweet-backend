const mongoose = require('mongoose');

const dbConnection = async () => {

    try{

        mongoose.connect(process.env.DB_CONNECTION);
        console.log('DB online');

    }catch(e){

        console.log(e);
        throw new Error('Error, look the logs')

    }

}

module.exports = {
    dbConnection
}