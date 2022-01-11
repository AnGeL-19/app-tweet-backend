const {Schema,model} = require('mongoose');

const CommentSchema = Schema({

    date: {
        type: Date,
        default: new Date()
    },
    userComment: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
    
});

CommentSchema.method('toJSON', function() {
    const { __v, _id, password, ...object} = this.toObject();
    object.cid = _id;
    return object;
});

module.exports = model('Comment', CommentSchema);