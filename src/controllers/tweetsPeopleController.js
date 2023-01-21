const { response } = require('express');
const { request } = require('express');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');



const getTweetsByUserId = async (req, res) => {


    const {id} = req.params;
    // const {uid: iduser} = req;
    const {limit = 5, start = 1, end = 1} = req.query;

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

        const tweets = tweetsUser.posts.map(tweet => {
     
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
            a.date > b.date ? -1 :
            a.date < b.date ? 1:
            0
        )

        return res.status(200).json({
            ok: true,
            uid: tweetsUser._id,
            tweets
        })

    }catch(e){
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }


}

const getTweetsFollowing = async (req = request, res = response) => {

    try{
        const {uid} = req;

        const {limit = 5, start = 1, end = 1} = req.query;
  
        // const tweets =  [];
        let valueTweetsFollowing = [];
        const arrayRandomNumber = []; 

        const tweetsFollowing = await User.findById(uid).select('following')
        .populate({ 
            path: 'following', select: 'posts',
            populate: {
                path: 'posts' ,
                options: { 
                    skip: 0, // Starting Row
                    // limit: 1, // Ending Row
                    sort: { date : -1 } 
                },
                populate: {
                    path: 'userTweet retweets', 
                    select: '_id imgUser name' }
            }
        })
        .populate({ 
            path: 'following', select: 'posts',
            populate: {
                path: 'posts' ,
                options: { 
                    skip: 0, // Starting Row
                    // limit: 1, // Ending Row
                    sort: { date : -1 } 
                },
                populate: {
                    path: 'comentPeople',
                    options: { 
                        skip: 0, // Starting Row
                        limit: 3, // Ending Row
                        sort: { nLikes : -1 } 
                    },
                    populate: {path: 'userComment', select: '_id imgUser name' }
                },
            }
        })

        // const { _id: uid } = tweetsFollowing;
        console.log(tweetsFollowing);
        
        // TOMAR 10 TWEETS POR TODOS LOS USURIOS
        const tweets = []    

        tweetsFollowing.following.map( postsUser => {

            const { _id: uidF ,posts } = postsUser;   
            // console.log(posts);      

            posts.map( tweet => {
                const { userTweet, ...restTweet } = tweet;
                const { _id: tid, retweets, comentPeople ,...restTweetClean } = restTweet._doc
                const { _id, ...restUser } = userTweet._doc;

                if (retweets.length !== 0) {

                    retweets.map( retweet => {

                        if(retweet._id === uid ){
                            tweets.push({
                                tid,
                                ...restTweetClean,
                                retweetUser: 'You Retweeted',
                                retweets: retweets.map( retweet => retweet._id),
                                userTweet: {
                                    uid: _id,
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
                            })
                        }else if (tweetsFollowing.following.find( userR => `${userR._id}` === `${retweet._id}`)) {
                            tweets.push({
                                tid,
                                ...restTweetClean,
                                retweetUser: `${retweet.name} Retweeted`,
                                retweets: retweets.map( retweet => retweet._id),
                                userTweet: {
                                    uid: _id,
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
                            })
                            console.log(`${retweet.name} Retweeted`);
                        }
                    })                  
                }

                tweets.push({
                    tid,
                    ...restTweetClean,
                    retweets: retweets.map( retweet => retweet._id),
                    userTweet: {
                        uid: _id,
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
                })

            });   
        })

        return res.status(200).json({
            ok: true,
            nTweets: tweets.length,
            tweets: tweets.sort((a, b) => 
                        a.date > b.date ? -1 :
                        a.date < b.date ? 1:
                        0
                    )
            // tweetsFollowing
        });

    }catch(e){

        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const getTweetsPopular = async (req = request, res = response) => {

    try{
        
        const tweet = await Tweet.find({})
        .sort({ nLikes: -1 })
        .populate({path:'userTweet', select: '_id name imgUser'})
        .populate({ 
            path: 'comentPeople',
            options: { 
                skip: 0, // Starting Row
                limit: 3, // Ending Row
                sort: { nLikes : -1 } 
            },
            populate: {path: 'userComment', select: '_id imgUser name' }  
        })
        // .limit(10)

        console.log(tweet);
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
        }).sort((a, b) => 
        a.nLikes > b.nLikes ? -1 :
        a.nLikes < b.nLikes ? 1:
        a.nRetweets > b.nRetweets ? -1 :
        a.nRetweets < b.nRetweets ? 1:
        0
        )

        return res.status(200).json({
            ok: true,
            tweets
        });

    }catch(e){

        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    } 

}

const getTweetsAndRetweets = async ( req = request, res = response) => {

    try {

        const {uid} = req.params;
        const tr = [];

        const user = await User.findById(uid).populate({path: 'posts retweets', populate: {path: 'userTweet', select: '_id imgUser name'}});
        
        const userRetweets = user.retweets.map(r => {
            const {followers, following, ...rest} = r.userTweet._doc
            return {
                ...r._doc,
                userTweet: rest,
                userRetweet: 'You retweeted'
            }
        } )

        // console.log(a)      
        tr.push(...user.posts, ...userRetweets)
        console.log(tr);
        // console.log(user);

        res.status(200).json({
            ok: true,
            tweetRetweet: tr
        })
        
    } catch (e) {
        console.log(e);
        res.status(500).json({
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
            const {hashtagTweet, ...rest} = h._doc;
            return {
                ...rest,
            }
        })

        // console.log(hashtags);

        res.status(200).json({
            ok: true,
            tweets: hts
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const getSearchHashtag = async (req = request, res = response) => {

    // BUSCAR DE TWEETS DE HASHTAGS 

    const {hashtag} = req.query;

    try {
        
        const hashtags = await Hashtag.findOne({nameHashtag: hashtag})
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
        // .sort({ nTweets: -1 });
        
        const tweets = hashtags.hashtagTweet.map( tw => {

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
        }).sort((a, b) =>
            // a.date > b.date ? -1 :
            // a.date < b.date ? 1:
            a.nLikes > b.nLikes ? -1 :
            a.nLikes < b.nLikes ? 1:
            a.nRetweets > b.nRetweets ? -1 :
            a.nRetweets < b.nRetweets ? 1:
            0)

        console.log(tweets);

        return res.status(200).json({
            ok: true,
            tweets
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });

    }

}

const getTweetsSaved = async (req = request, res = response) => {

    const {uid:id} = req;
    const {limit = 5, start = 1, end = 1} = req.query;
    console.log(id);

    try{

        const tweetsUser = await User.findById(id)
        .populate({
            path: '_id saved', 
            populate: {path: 'userTweet', select: '_id imgUser name'}
        }).populate({ 
            path: '_id saved', 
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

        const tweets = tweetsUser.saved.map(tweet => {
     
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
            uid: tweetsUser._id,
            tweets: tweets.sort((a, b) => 
                a.date > b.date ? -1 :
                a.date < b.date ? 1:
                0
            )
        })

    }catch(e){
        console.log(e);
        res.status(500).json({
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
}