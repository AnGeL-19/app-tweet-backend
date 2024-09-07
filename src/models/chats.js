const {Schema,model} = require('mongoose');

const CommentSchema = Schema({

    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,  
    },
    userTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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

CommentSchema.method('toJSON', function() {
    const { __v, _id, ...object} = this.toObject();
    object.cid = _id;
    return object;
});

module.exports = model('Chats', CommentSchema);