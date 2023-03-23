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
        type: String,
        default: ''
    },
    imgUser:{
        type: String,
        default: 'https://res.cloudinary.com/dl9e7nlbu/image/upload/c_scale,h_69/v1679442102/usuario_nq3l93.jpg'
    },
    imgUserBackground:{
        type: String,
        default: 'https://www.pixelstalk.net/wp-content/uploads/2016/04/Grey-backgrounds-free-download.jpg'
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
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

});

// UserSchema.pre('find', function (next) {
//     if (this.options._recursed) {
//       return next();
//     }
//     this.populate({ path: "followers following", options: { _recursed: true } });
//     next();
// });

UserSchema.method('toJSON', function() {
    const { __v, _id, password, ...object} = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('User', UserSchema);