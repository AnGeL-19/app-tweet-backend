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
            skip: (page - 1) * limit, // Starting Row
            limit: limit, // Ending Row
            sort: { date : -1 } 
        })
        .populate({   
            path: 'userTweet retweets', 
            select: '_id imgUser name'
        })
        .populate({   
            path: 'comentPeople',
            options: { 
                skip: 0, // Starting Row
                limit: 1, // Ending Row
                sort: { nLikes : -1 } 
            },
            populate: {path: 'userComment', select: '_id imgUser name' }
        })

        const tweetF = tweetsFollowing.map( tweet => {

            const { userTweet ,...restTweet } = tweet;
            const { _id: tid, retweets, saved, likes, comentPeople, __v, ...restTweetClean } = restTweet._doc
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
                },
                comentPeople: comentPeople.map(cmm => {
                    const { ...rest } = cmm
                    const { _id, __v, ...restClean } = rest._doc
                    return {
                        cid: _id,
                        ...restClean
                    }
                })
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

    const {uid} = req.uid;
    const {filter='', search = '', limit = 5, page = 1} = req.query;
    
    
    let objFilter = {}

    if (filter==='top') {
        objFilter={
            sort: { nLikes: -1 }
        }
    }else{
        objFilter={
            sort: {
                date: -1
            } 
        }
    }

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
                skip: (page - 1) * limit,
                limit: limit,
                ...objFilter
            })
        .populate({
            path:'userTweet retweets', 
            select: '_id name imgUser'
        })
        .populate({ 
            path: 'comentPeople',
            options: { 
                skip: 0, // Starting Row
                limit: 1, // Ending Row
                sort: { nLikes : -1 } 
            },
            populate: {
                path: 'userComment', 
                select: '_id imgUser name' 
            }  
        })

        const tweets = tweetResponse.map( tw => {
           
            const { userTweet ,...restTweet } = tw;
            const { _id: tid, retweets, comentPeople, __v, ...restTweetClean } = restTweet._doc
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
                        return null;
                    }
                })[0]
                ,
                retweets: retweets.map( retweet => retweet._id),
                userTweet: {
                    uid: _id,
                    ...restUser
                },
                comentPeople: comentPeople.map(cmm => {
                    const { ...rest } = cmm
                    const { _id, __v, ...restClean } = rest._doc
                    return {
                        cid: _id,
                        ...restClean
                    }
                })
            }
        })

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

const getSearchHashtag = async (req = request, res = response) => {

    const {hashtag, limit = 5, page = 1} = req.query;
    console.log(hashtag);

    try {
        
        
        const hashtagResponse = await Hashtag.findOne({ nameHashtag: hashtag })
        console.log(hashtagResponse);
         
        const tweetHastags = await Tweet.find({hashtagsTweet: hashtagResponse._id, showEveryone: true},null,{
            skip: (page - 1) * limit, // Starting Row
            limit: limit, // Ending Row
        })
        .populate({
            path: 'userTweet', select: '_id imgUser name'
        })
        .populate({ 
            path: 'comentPeople',
            options: { 
                skip: 0, // Starting Row
                limit: 1, // Ending Row
                sort: { nLikes : -1 } 
            },
            populate: {path: 'userComment', select: '_id imgUser name' } 
        })
        console.log(tweetHastags);

        const tweets = tweetHastags.map( tw => {

            const { __v,_id: tid, userTweet, comentPeople, ...others } = tw._doc;
            const {followers, following, _id: uid,...restUser } = userTweet._doc;

            return {
                tid,
                userTweet: {
                    uid,
                    ...restUser
                },
                comentPeople: comentPeople.map(cmm => {
                    const { ...rest } = cmm
                    const { _id, ...restClean } = rest._doc
                    return {
                        cid: _id,
                        ...restClean
                    }
                }),
                ...others
            }
        })

        return res.status(200).json({
            ok: true,
            data: tweets
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const getTweetsSaved = async (req = request, res = response) => {

    const {uid} = req;
    const {limit = 5, page = 1} = req.query;
    // console.log(id);

    try{

        const tweetsResponse = await Tweet.find({ saved: uid })
                                 .populate({
                                    path: 'userTweet', select: '_id imgUser name'
                                 })
                                 .populate({
                                    path: 'comentPeople',
                                    options: { 
                                        skip: 0, // Starting Row
                                        limit: 1, // Ending Row
                                        sort: { nLikes : -1 } 
                                    },
                                    populate: {path: 'userComment', select: '_id imgUser name' }
                                 })
                                 .skip((page - 1) * limit)
                                 .limit(limit)


        const tweets = tweetsResponse.map(tweet => {
     
            const { _id: tid, __v, comentPeople ,userTweet, ...rest } = tweet._doc;
            const { _id: id ,...restUser } = userTweet._doc

            return{
                tid,
                ...rest,
                userTweet: {
                    uid: id,
                    ...restUser
                },
                comentPeople: comentPeople.map(cmm => {
                    const { ...rest } = cmm
                    const { _id, ...restClean } = rest._doc
                    return {
                        cid: _id,
                        ...restClean
                    }
                })
            }
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

const getTweetsLiked = async (req = request, res = response) => {

    const {uid} = req;

    const {limit = 5, page = 1} = req.query;

    try{

        const tweetsResponse = await Tweet.find({ likes: uid })
                                 .populate({
                                    path: 'userTweet', select: '_id imgUser name'
                                 })
                                 .populate({
                                    path: 'comentPeople',
                                    options: { 
                                        skip: 0, // Starting Row
                                        limit: 1, // Ending Row
                                        sort: { nLikes : -1 } 
                                    },
                                    populate: {path: 'userComment', select: '_id imgUser name' }
                                 })
                                 .skip((page - 1) * limit)
                                 .limit(limit)


        const tweets = tweetsResponse.map(tweet => {
     
            const { _id: tid, __v, comentPeople ,userTweet, ...rest } = tweet._doc;
            const { _id: id ,...restUser } = userTweet._doc

            return{
                tid,
                ...rest,
                userTweet: {
                    uid: id,
                    ...restUser
                },
                comentPeople: comentPeople.map(cmm => {
                    const { ...rest } = cmm
                    const { _id, ...restClean } = rest._doc
                    return {
                        cid: _id,
                        ...restClean
                    }
                })
            }
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
    getSearchHashtag,
    getTweetsSaved,
    getTweetsLiked

}