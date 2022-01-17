const {Schema,model} = require('mongoose');

const CommentSchema = Schema({

    
    userComment: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,  
    },
    tweetComment: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true,  
    },   
    commentText: {
        type: String,
        default: ''
    },
    imgComment:{
        type: String,
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    date: {
        type: Date,
        default: new Date()
    },
    
});

CommentSchema.method('toJSON', function() {
    const { __v, _id, password, ...object} = this.toObject();
    object.cid = _id;
    return object;
});

module.exports = model('Comment', CommentSchema);