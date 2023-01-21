const {Schema, model} = require('mongoose');

const HashtagSchema = Schema({

	nameHashtag: {
		type: String		
	},
	tweet:{
		type: Schema.Types.ObjectId,
		ref: 'Tweet',
		required: true
	},
	nTweets: {
		type: Number,
		default: 1
	},
	hashtagTweet: [{
		type: Schema.Types.ObjectId,
		ref: 'Tweet'
	}]

});

HashtagSchema.method('toJSON', function() {
    const { __v, _id ,...object} = this.toObject();
    object.hid = _id;
    return object;
});

module.exports = model('Hashtag', HashtagSchema);