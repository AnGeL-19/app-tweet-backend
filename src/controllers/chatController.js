const Connect = require("../models/connect")
const User = require("../models/user")



const connectUser = async (socket, obj) => {

    try {
        
        const connect = new Connect({
            userFrom: obj.userFrom.id, 
            userTo: obj.userTo
        })

        await connect.save();

        // console.log(connect);
        
        console.log( obj.userTo, '----------');
        console.log(`notification-${obj.userTo}`);
        
        socket.to(`notification_user_${obj.userTo}`).emit('notification', {
            user: obj.userFrom,
            message: 'This user want to connect with you'
        });
       
        

    } catch (error) {
        console.log(error);
        
    }

    // connections.forEach(( connect ) => socket.join(connect))

    
    // socket.to("connection:").emit("project updated");

}


module.exports = {
    connectUser
}