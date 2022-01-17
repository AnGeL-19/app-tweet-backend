const {Schema,model} = require('mongoose');

const UserSchema = Schema({

    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String
    },
    imgUser:{
        type: String,
        default: ''
    },
    imgUserBackground:{
        type: String,
        default: ''
    },
    loginGoogle: {
        type: Boolean,
        default: false
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    retweets: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    saved: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    folling: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

});

UserSchema.method('toJSON', function() {
    const { __v, _id, password, ...object} = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('User', UserSchema);