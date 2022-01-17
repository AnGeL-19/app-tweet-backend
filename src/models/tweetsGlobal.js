const {Schema, model} = require('mongoose');

const TweetsGlobalSchema = Schema({
    year:{
        type: Number,
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }],
});

TweetsGlobalSchema.method('toJSON', function() {
    const { __v, _id ,...object} = this.toObject();
    object.tgid = _id;
    return object;
});

module.exports = model('TweetsGlobal', TweetsGlobalSchema);