const Chats = require("../models/chats")
const Connect = require("../models/connect")
const User = require("../models/user")

const getMessages = async (req = request, res = response) => {

    const { id } = req.params
    const {limit = 10, page = 1} = req.query;

    try {

        const chats = await Chats.find({
                connection: id
            },
            null,
            { 
                sort: { _id: -1 } ,
                skip: (page - 1) * limit, // Starting Row
                limit, // Ending Row
            }
        ).populate({
            path: 'user',
            select: '_id name imgUser'
        })

        return res.status(200).json({
            ok: true,
            length: chats.length,
            data: chats.reverse()
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const sendMessage = async (socket, obj) => {

    try {

        const chat = new Chats({
            connection: obj.connectId,
            message: obj.message,
            user: obj.user.id
        })

        const newChat = await chat.save()

        const messageFormat = {
            id: newChat._id,
            date: newChat.date,
            message: newChat.message,
            user: obj.user,
        }
    
         // Emitir a todos los miembros de la sala menos al emisor
        // socket.broadcast.to(roomId).emit('receiveMessage', messageFormat);

        // Emite a todos en la sala
        socket.to(obj.connectId).emit('receiveMessage', messageFormat);

        // solo al emisor
        socket.emit('receiveMessage', messageFormat);

    } catch (error) {
        console.log(error);
        
    }

}

const joinChats = async (socket, idUser) => {
    try {
        
        const user = await User.findById(idUser).select('connects')

        // 
        user.connects.forEach( connect => {
            socket.join(connect.toString())
        })

        

    } catch (error) {
        console.log(error);
        
    }
}

module.exports = {
    getMessages,
    sendMessage,
    joinChats
}