const { response } = require('express');
const { request } = require('express');

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');
// const { populate } = require('../models/tweet');


const getTweetsFollowing = async (req = request, res = response) => {

    try{
        const { uid } = req.uid;

        const {limit = 5, page = 1} = req.query;

        const user = await User.findById(uid).select('following')

        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        const tweetsFollowing = await Tweet.find({
                userTweet: {
                    $in: [...followings, uid]
                }, 
                showEveryone: true
            },
            null,
            { 
                sort: { _id: -1 } ,
                skip: (page - 1) * limit, // Starting Row
                limit: limit, // Ending Row
            }
        )
        .populate({   
            path: 'userTweet retweets', 
            select: '_id imgUser name'
        })

        const tweetF = tweetsFollowing.map( tweet => {

            const { userTweet ,...restTweet } = tweet;
            const { _id: tid, retweets, saved, likes, __v, ...restTweetClean } = restTweet._doc
            const { _id, ...restUser } = userTweet._doc;

  
            return {
                tid,
                ...restTweetClean,
                userRetweet: retweets.map( re => {
                    if (re._id == uid) {
                        return 'You Retweeted'
                    }else if (followings.find(userR => `${userR._id}` == `${re._id}`)) {
                        return `${re.name} Retweeted`
                    }else{
                        return '';
                    }
                })[0]
                ,
                retweeted: !!retweets.find( user => user._id.toString() === uid),
                liked: likes.includes(uid),
                saved: saved.includes(uid),
                userTweet: {
                    uid: _id,
                    ...restUser
                }
            }
                   
        });   
        

        return res.status(200).json({
            ok: true,
            length: tweetF.length,
            data: tweetF
        });

    }catch(e){

        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const getTweetsExplore = async (req = request, res = response) => {

    const { uid } = req.uid;
    const {filter='', search = '', limit = 5, page = 1} = req.query;
    
    
    let objFilter = {}

    switch (filter) {
        case 'top':
            objFilter={
                sort: { 
                    nLikes: -1,
                    _id: 1
                }
            }
            break;
        case 'lastest':
            objFilter={
                sort: {
                    date: -1,
                    _id: 1
                } 
            }
            break;
        default:
            objFilter={
                sort: { 
                    date: -1,
                    _id: 1 
                }
            }
            break;
    }

    console.log(filter);
    

    try{

        const hashtag = search.split('#')[0] || ''

        const [ user, hashtagResponse ] = await Promise.all([
            User.findById(uid).select('following'),
            Hashtag.findOne({ nameHashtag: `#${hashtag}` })
        ])


        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        let hashtagsObj = {}
        if(hashtagResponse){
            hashtagsObj = {
                hashtagsTweet: hashtagResponse._id 
            }
        }

        const tweetResponse = await Tweet.find({ 
                description : { $regex: `${search}` }, 
                showEveryone: true,
                ...hashtagsObj
            },
            null,
            {
                ...objFilter,
                skip: (page - 1) * limit,
                limit: limit,
            })
        .populate({
            path:'userTweet retweets', 
            select: '_id name imgUser'
        })

        const tweets = tweetResponse.map( tweet => {

            const { userTweet ,...restTweet } = tweet;
            const { _id: tid, retweets, saved, likes, __v, ...restTweetClean } = restTweet._doc
            const { _id, ...restUser } = userTweet._doc;

  
            return {
                tid,
                ...restTweetClean,
                userRetweet: retweets.map( re => {
                    if (re._id == uid) {
                        return 'You Retweeted'
                    }else if (followings.find(userR => `${userR._id}` == `${re._id}`)) {
                        return `${re.name} Retweeted`
                    }else{
                        return '';
                    }
                })[0]
                ,
                retweeted: !!retweets.find( user => user._id.toString() === uid),
                liked: likes.includes(uid),
                saved: saved.includes(uid),
                userTweet: {
                    uid: _id,
                    ...restUser
                }
            }
                   
        });

        return res.status(200).json({
            ok: true,
            length: tweets.length,
            data: tweets
        });

    }catch(e){

        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    } 

}

const getHashtags = async (req = request, res = response) => {

    // 

    try {
        
        const hashtags = await Hashtag.find({}).sort({ nTweets: -1 }).limit(5);

        const hts = hashtags.map(h => {
            const {hashtagTweet, _id,...rest} = h._doc;
            return {
                hid: _id,
                ...rest,
            }
        })

        // console.log(hashtags);

        return res.status(200).json({
            ok: true,
            data: hts
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const getTweetsBookMarks = async (req = request, res = response) => {

    const { uid } = req.uid;
    const { limit = 5, page = 1, filter = 'tweets' } = req.query;
    // console.log(id);

    let optionFilter = {}
    switch (filter) {
        case 'tweets':
            optionFilter = {
                saved: uid
            }
            break;
        case 'likes':
            optionFilter = {
                likes: uid
            }
            break;
        case 'tweetsReplies':
            optionFilter = {
                retweets: uid
            }
            break;       
        default:
            optionFilter = {
                saved: uid
            }
            break;
    }

    console.log(filter, optionFilter);
    

    try{

        const [ user, tweetsResponse ] = await Promise.all([
            User.findById(uid).select('following'),
            Tweet.find(optionFilter)
                                 .populate({
                                    path: 'userTweet retweets', select: '_id imgUser name'
                                 })
                                 .sort({_id: 1})
                                 .skip((page - 1) * limit)
                                 .limit(limit)
        ])


        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        // const tweetsResponse = await 


        const tweets = tweetsResponse.map(tweet => {
        const { userTweet, ...restTweet } = tweet;
        const { _id: tid, retweets, saved, likes, __v, ...restTweetClean } = restTweet._doc;
        const { _id, ...restUser } = userTweet._doc;

        return {
            tid,
            ...restTweetClean,
            userRetweet: retweets.map(re => {
                if (re._id.toString() === uid) {
                    return 'You Retweeted';
                } else if (followings.find(userR => `${userR._id}` === `${re._id}`)) {
                    return `${re.name} Retweeted`;
                } else {
                    return '';
                }
            })[0],
            retweeted: !!retweets.find(user => user._id.toString() === uid),
            liked: likes.includes(uid),
            saved: saved.includes(uid),
            userTweet: {
                uid: _id,
                ...restUser
            }
        };
    });


        return res.status(200).json({
            ok: true,
            length: tweets.length,
            data: tweets
        })


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

module.exports = {

    getTweetsFollowing,
    getTweetsExplore,
   
    getHashtags,
    getTweetsBookMarks

}