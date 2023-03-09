const { response } = require('express');
const { request } = require('express');

const Tweet = require('../models/tweet');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');
const { populate } = require('../models/tweet');



const getTweetsByUserId = async (req, res) => {


    const {id} = req.params;
    // const {uid: iduser} = req;
    const {limit = 5, start = 0, end = 5, filter} = req.query;
    
    let options;

    if (filter === 'likes') {
        options = (a,b) => a.nLikes > b.nLikes ? -1:
                        a.nLikes < b.nLikes ? 1:
                        0
    }else{
        options = (a,b) => a.date> b.date ? -1:
                        a.date < b.date ? 1:
                        0
    }

    try{

        const tweetsUser = await User.findById(id)
        .populate({
            path: 'posts',
            populate: {
                path: 'userTweet', 
                select: '_id imgUser name followers',
            }            
        }).populate({
            path: 'posts',
            options,
            populate:{
                path: 'comentPeople',
                options: { 
                    skip: 0, // Starting Row
                    limit: 3, // Ending Row
                    sort: { nLikes : -1 } 
                },
                populate: {path: 'userComment', select: '_id imgUser name' }
            }
        })
        

        const tweets = tweetsUser.posts.slice(start, end).map(tweet => {
     
            const { _id: tid, __v, userTweet, comentPeople, ...rest } = tweet._doc;
            const { followers, _id: uid ,...restUser } = userTweet._doc

            return{
                tid,
                ...rest,
                userTweet: {
                    uid,
                    ...restUser,
                    followers: followers.length
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
        }).sort((a, b) => 
            options(a,b)
        )

        return res.status(200).json({
            ok: true,
            uid: tweetsUser._id,
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

const getTweetsFollowing = async (req = request, res = response) => {

    try{
        const {uid} = req;

        const {limit = 5, start = 1, end = 5} = req.query;

        const user = await User.findById(uid).select('following')

        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        console.log(start, end);

        // userTweet
        // { name : { $regex: `${search}` }, $nor: [{_id: uid }, ...followings] }
        // likes: { $in: ['vaporizing', 'talking'] }

        // console.log("--------------------------------");

        const tweetsFollowing = await Tweet.find({userTweet: {$in: [...followings]}},null,{ 
            skip: start, // Starting Row
            limit: end, // Ending Row
            sort: { date : -1 } 
        })
        .populate({   
            path: 'userTweet retweets', 
            select: '_id imgUser name'
        })
        .populate({   
            path: 'comentPeople',
            options: { 
                skip: 1, // Starting Row
                limit: 3, // Ending Row
                sort: { nLikes : -1 } 
            },
            populate: {path: 'userComment', select: '_id imgUser name' }
        }).limit(limit)

        // console.log(tweetsFollowing);
        

        const tweetF = tweetsFollowing.map( tweet => {

            const { userTweet ,...restTweet } = tweet;
            const { _id: tid, retweets, comentPeople, __v, ...restTweetClean } = restTweet._doc
            const { _id, ...restUser } = userTweet._doc;

            if (retweets.length !== 0) {

                retweets.map( retweet => {

                    if(retweet._id === uid ){
                        return {
                            tid,
                            ...restTweetClean,
                            userRetweet: 'You Retweeted',
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
                    }else if (tweetsFollowing.following.find( userR => `${userR._id}` === `${retweet._id}`)) {
                        return {
                            tid,
                            ...restTweetClean,
                            userRetweet: `${retweet.name} Retweeted`,
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
                    }
                })                  
            }

            return {
                tid,
                ...restTweetClean,
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

const getTweetsPopular = async (req = request, res = response) => {

    const {filter, search = '' ,limit = 5, start = 1, end = 5} = req.query;

    
    let objFilter = {}

    if (filter==='top') {
        objFilter={
            skip: start,
            limit: end,
            sort: { nLikes: -1 }
        }
    }else{
        objFilter={
            skip: start,
            limit: end,
            sort: {
                date: -1
            } 
        }
    }

    try{

        const tweet = await Tweet.find({ description : { $regex: `${search}` } },null,objFilter)
        .populate({
            path:'userTweet', 
            select: '_id name imgUser'
        })
        .populate({ 
            path: 'comentPeople',
            options: { 
                skip: 0, // Starting Row
                limit: 3, // Ending Row
                sort: { nLikes : -1 } 
            },
            populate: {
                path: 'userComment', 
                select: '_id imgUser name' 
            }  
        }).limit(limit)


        const tweets = tweet.map( tw => {

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

const getTweetsAndRetweets = async ( req = request, res = response) => {

    try {

        const {uid} = req.params;
        const tr = [];

        const user = await User.findById(uid)
        .populate(
            {
                path: 'posts retweets', 
                populate: {
                    path: 'userTweet', select: '_id imgUser name'
                }
            })
        .populate({
                path: 'posts retweets', 
                populate: {
                    path: 'comentPeople',
                    options: { 
                        skip: 0, // Starting Row
                        limit: 3, // Ending Row
                        sort: { nLikes : -1 } 
                    },
                    populate: {path: 'userComment', select: '_id imgUser name' }  
                }  
            })
            .limit(10)
        
        const userRetweets = user.retweets.map(r => {
            const {followers, following, __v,...rest} = r.userTweet._doc
            return {
                ...r._doc,
                userTweet: rest,
                userRetweet: 'You retweeted',
                comentPeople: r.comentPeople.map(cmm => {
                    const { ...rest } = cmm
                    const { _id, ...restClean } = rest._doc
                    return {
                        cid: _id,
                        ...restClean
                    }
                })
            }
        } )
   
        console.log(userRetweets);

        tr.push(...user.posts, ...userRetweets)

        return res.status(200).json({
            ok: true,
            data: tr
        })
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        })
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

    const {hashtag, limit = 5, start = 0, end = 5} = req.query;
    console.log(hashtag);

    try {
        
        const hashtags = await Hashtag.findOne({nameHashtag: hashtag })
        .populate({
            path: 'hashtagTweet', 
            populate: {
                path: 'userTweet', select: '_id imgUser name'
            }
        })
        .populate({ 
            path: 'hashtagTweet', 
            populate: {
                path: 'comentPeople',
                options: { 
                    skip: 0, // Starting Row
                    limit: 3, // Ending Row
                    sort: { nLikes : -1 } 
                },
                populate: {path: 'userComment', select: '_id imgUser name' } 
            } 
        })
        

        console.log(hashtags);

        const tweets = hashtags.hashtagTweet.slice(start,end).map( tw => {

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

        // console.log(tweets);

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

    const {uid:id} = req;
    const {limit = 5, start = 0, end = 5} = req.query;
    console.log(id);

    try{

        const tweetsUser = await User.findById(id)
        .populate({
            path: 'saved', 
            populate: {path: 'userTweet', select: '_id imgUser name'}
        }).populate({ 
            path: 'saved', 
            populate: {
                path: 'comentPeople',
                options: { 
                    skip: 0, // Starting Row
                    limit: 3, // Ending Row
                    sort: { nLikes : -1 } 
                },
                populate: {path: 'userComment', select: '_id imgUser name' }
            }  
        })

        const tweets = tweetsUser.saved.slice(start, end).map(tweet => {
     
            const { _id: tid, __v, comentPeople ,userTweet, ...rest } = tweet._doc;
            const { _id: uid ,...restUser } = userTweet._doc

            return{
                tid,
                ...rest,
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
                })
            }
        });

        return res.status(200).json({
            ok: true,
            data: tweets.reverse()
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

    const {uid:id} = req;
    const {limit = 5, start = 1, end = 1} = req.query;
    console.log('liked');

    try{

        const tweetsUser = await User.findById(id)
        .populate({
            path: 'likes', 
            populate: {path: 'userTweet', select: '_id imgUser name'}
        }).populate({ 
            path: 'likes', 
            populate: {
                path: 'comentPeople',
                options: { 
                    skip: 0, // Starting Row
                    limit: 3, // Ending Row
                    sort: { nLikes : -1 } 
                },
                populate: {path: 'userComment', select: '_id imgUser name' }
            }  
        })

        const tweets = tweetsUser.likes.slice(start, end).map(tweet => {
     
            const { _id: tid, __v, comentPeople ,userTweet, ...rest } = tweet._doc;
            const { _id: uid ,...restUser } = userTweet._doc

            return{
                tid,
                ...rest,
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
                })
            }
        });


        return res.status(200).json({
            ok: true,
            data: tweets.reverse()
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}



// await tweets.sort((date1, date2) => date1 - date2);

// const tweets = await Tweet.where({
//     $or:[
//         {
//             'userTweet':{
//                 $in: tweetsFollowing.following
//             }
//         },
//         {
//             'retweets': {
//                 $in: tweetsFollowing.following
//             }
//         }]
// })

// ({"address.current":{$in:["Jupitor", "Mars"]}});
// const tweets = await Tweet.find()
// {path: 'messages', select: '_id from message createdAt messageSpecial', populate: {path: 'from', select: '_id name img'}}



module.exports = {

    getTweetsFollowing,
    getTweetsPopular,
    getTweetsAndRetweets,
    getHashtags,
    getSearchHashtag,
    getTweetsByUserId,
    getTweetsSaved,
    getTweetsLiked

}