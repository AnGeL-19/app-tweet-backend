const Tweet = require("../models/tweet");
const Comment = require("../models/comment");

const validTweetExist = async (id)  => {
    const tweetUser = await Tweet.findById(id);
    if(!tweetUser){     
        throw new Error(`Tweet doesn't exist ${id}`);      
    }
}

const validCommentExist = async (id)  => {
    const commentUser = await Comment.findById(id);
    if(!commentUser){     
        throw new Error(`CommentUser doesn't exist ${id}`);      
    }
}

module.exports = {
    validTweetExist,
    validCommentExist
}