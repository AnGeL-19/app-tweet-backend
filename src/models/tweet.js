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
    hashtagsTweet: [{
        type: Schema.Types.ObjectId,
        ref: 'Hashtag',
    }],
    imgTweet:{
        type: String,
    },
    showEveryone:{
        type: Boolean,
        default: true
    },
    showFollow:{
        type: Boolean,
        default: false
    },
    nRetweets: {
        type: Number,
        default: 0
    },
    retweets: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    nSaved: {
        type: Number,
        default: 0
    },
    saved: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    nLikes: {
        type: Number,
        default: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    nComentPeople: {
        type: Number,
        default: 0
    },
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