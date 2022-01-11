const {Schema,model} = require('mongoose');

const TweetSchema = Schema({

    date: {
        type: Date,
        default: new Date()
    },
    userTweet: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,  
    },   
    description: {
        type: String,
        default: ''
    },
    imgTweet:{
        type: String,
    },
    retweets: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    saved: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comentPeople: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
    
});

TweetSchema.method('toJSON', function() {
    const { __v, _id, password, ...object} = this.toObject();
    object.tid = _id;
    return object;
});

module.exports = model('Tweet', TweetSchema);