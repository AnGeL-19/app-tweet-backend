const {Schema,model} = require('mongoose');

const ChatSchema = Schema({

    connection: {
        type: Schema.Types.ObjectId,
        ref: 'Connect',
        required: true,  
    }, 
    message: {
        type: String,
        default: ''
    }, 
    date: {
        type: Date,
        default: new Date()
    },
    
});

ChatSchema.method('toJSON', function() {
    const { __v, _id, ...object} = this.toObject();
    object.cid = _id;
    return object;
});

module.exports = model('Chats', ChatSchema);