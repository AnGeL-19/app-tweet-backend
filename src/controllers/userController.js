const {response, request} = require('express');
const bcrypt = require('bcryptjs');

const Tweet = require('../models/tweet');
const User = require('../models/user');

const getUsers = async (req = request, res) => {

    const { uid: uidAuth } = req.uid;
    const { search = '', limit = 5, page = 1 } = req.query;

    try{

        const user = await User.findById(uidAuth).select('following')

        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        const users= await User.find({ 
            name : { $regex: `${search}` }, 
            $nor: [{_id: uidAuth }, ...followings] },
            null,
            {
                skip: (page - 1) * limit,
                limit: limit,
            }
        )
        .select('_id name bio imgUser imgUserBackground followers')    
        
    
        return res.status(200).json({
            ok: true,
            length: users.length,
            data: users
        })


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getUserById = async (req = request, res) => {

    const { id } = req.params;
    const { uid : uidAuth } = req.uid

    try{

        const user = await User.findById(id);

        if(user){

            const {followers, following, ...rest} = user;
            const { _id: uid, ...restdata } = rest._doc

            return res.status(200).json({
                ok: true,
                data: {
                    uid,
                    ...restdata,
                    nfollowers: followers.length,
                    nfollowing: following.length
                },
                isFollowing: followers.includes(uidAuth)
            })

        }else{
            return res.status(204).json({
                ok: true,
                msg: 'User not found'
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const updateUser = async (req = request, res) => {

    const {uid} = req;
    const {imgUser, imgUserBackground, name, bio, email, password} = req.body;
    
    let objUser = {
        imgUser, 
        imgUserBackground, 
        name, 
        bio, 
        email
    };

    try{
        

        if (password) {
            const salt = bcrypt.genSaltSync();
            objUser.password = bcrypt.hashSync(password, salt);
        }
        
        const user = await User.findByIdAndUpdate(uid, objUser, { new: true });

        if(user){

            return res.status(200).json({
                ok: true,
                msg: 'Update succesful'
            })

        }else{
            return res.status(204).json({
                ok: true,
                msg: 'User not found'
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getUserFollowers = async (req = request, res) => {

    const { id } = req.params;
    const { uid } = req.uid;
    const { limit = 5, page = 1 } = req.query;

    try{

        const users = await User.find({following: id}).select('_id name bio imgUser followers')
                                .skip((page - 1) * limit)
                                .limit(limit)     


        const mappingUser = users.map( (user) => {

            const { ...rest } = user;
            const { _id, followers, ...restDoc } = rest._doc;

            let isFollowing = (_id.toString() === uid) || followers.includes(uid);

            return {
                uid: _id,
                ...restDoc,
                nfollowers: followers.length,
                isFollowing
            }
        });


        return res.status(200).json({
            ok: true,
            length: mappingUser.length,
            data: mappingUser
        })
                        


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getUserFollowing = async (req = request, res) => {

    const { uid } = req.uid;
    const { id } = req.params;
    const { limit = 5, page = 1 } = req.query;

    try{
        
        const users = await User.find({followers: id}).select('_id name bio imgUser followers')
                                .skip((page - 1) * limit)
                                .limit(limit)
        

        const mappingUser = users.map( (user) => {

            const { ...rest } = user;
            const { _id, followers, ...restDoc } = rest._doc;

            let isFollowing = (_id.toString() === uid) || followers.includes(uid);
            
            return {
                uid: _id,
                ...restDoc,
                nfollowers: followers.length,
                isFollowing
            }
        });


        return res.status(200).json({
            ok: true,
            length: mappingUser.length,
            data: mappingUser
        })


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const addFollowAndUnfollow = async (req, res) => {


    const {id} = req.params;
    const {uid} = req.uid;

    try{
        
        const [userFollowing , user] = await Promise.all([
            User.findById(id).populate(),
            User.findById(uid).populate()
        ])


        if(user.following.includes(id)){
            console.log("si esta, dejar de seguir");
            // userFollowing.following.length

            await Promise.all([
                // user.updateOne({$pull: {following: id}}),
                user.updateOne({$pull: {following: id}}), // PULL SACA DEL ARRAY
                userFollowing.updateOne({$pull: {followers: uid}}),
                // userFollowing.updateOne({$pull: {followers: uid}})
            ]);
            return res.status(200).json({
                ok:true,
                msg: 'Unfollow',
                follow: false
            })
        }else{
            await Promise.all([
                user.updateOne({$push: {following: id}}), // PUSH SACA DEL ARRAY
                userFollowing.updateOne({$push: {followers: uid}})
            ]);
            return res.status(200).json({
                ok:true,
                msg: 'Following',
                follow: true
            })
        }       

        

    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }


}

const getUsersRecomment = async (req = request, res = response) => {

    const {uid} = req.uid;

    try {

        // mongoose.ObjectId(uid)
        const followingsUser = await User.findById(uid).select('following')

        const followings = followingsUser.following.map( f => {
            return {
                _id: f
            }
        })

        const users = await User.find({$nor: [{_id: uid }, ...followings] })
        .select('_id name bio imgUser imgUserBackground followers')
        .limit(2)

        return res.status(200).json({
            ok: true,
            data: users
        }); 

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getTweetsByUserId = async (req, res) => {

    const { uid } = req.uid 
    const { id } = req.params;
    const { limit = 5, page = 1, filter } = req.query;
    
    let objFilter = {};
    let tweetOptions = {};

    switch (filter) {
        case 'likes':
            objFilter = { sort: { nLikes: -1 } };
            tweetOptions = { userTweet: id, showEveryone: true };
            break;
        case 'tweets':
            objFilter = { sort: { date: -1 } };
            tweetOptions = { userTweet: id, showEveryone: true };
            break;
        case 'tweetsReplies':
            objFilter = { sort: { date: -1 } };
            tweetOptions = { showEveryone: true };
            break;
        default:
            tweetOptions = { userTweet: id, showEveryone: true };
            break;
    }

    console.log(filter);
    

    try{

        let tweetsResponse;
        if (filter === 'tweetsReplies') {
            tweetsResponse = await Tweet.find({
                ...tweetOptions
            })
            .or([{ userTweet: id }, { retweets: id }])
            .populate({ path: 'userTweet retweets', select: '_id imgUser name' })
            .sort(objFilter.sort)
            .skip((page - 1) * limit)
            .limit(limit);
        } else {
            tweetsResponse = await Tweet.find({
                ...tweetOptions
            })
            .populate({ path: 'userTweet retweets', select: '_id imgUser name' })
            .sort(objFilter.sort)
            .skip((page - 1) * limit)
            .limit(limit);
        }

        

        const tweets = tweetsResponse.map(tweet => {
            const { userTweet, ...restTweet } = tweet;
            const { _id: tid, retweets, saved, likes, __v, ...restTweetClean } = restTweet._doc;
            const { _id,...restUser } = userTweet._doc;

            return {
                tid,
                ...restTweetClean,
                userRetweet: retweets.map(re => {
                    if (re._id.toString() === uid) {
                        return 'You Retweeted';
                    } else if (followings.find(userR => `${userR._id}` === `${re._id}`)) { // ARREGLAR ESTA PARTE, TRUENA EN followings
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
    
    const {limit = 5, page = 1} = req.query;

    try {

        const {id} = req.params;

        const tweetsResponse = await Tweet.find()
                                      .or([{ userTweet: id }, { retweets: id }])
                                      .populate({
                                            path: 'userTweet retweets', select: '_id imgUser name'
                                      })
                                      .populate(
                                        {
                                            path: 'comentPeople',
                                            options: { 
                                                skip: 0, // Starting Row
                                                limit: 1, // Ending Row
                                                sort: { nLikes : -1 } 
                                            },
                                            populate: {path: 'userComment', select: '_id imgUser name' }
                                        }
                                      )
                                      .skip((page - 1) * limit)
                                      .limit(limit);


        const tweetsAndRetweets = tweetsResponse.map( tweet => {

            const { userTweet ,...restTweet } = tweet;
            const { _id: tid, retweets, comentPeople, __v, ...restTweetClean } = restTweet._doc
            const { _id, ...restUser } = userTweet._doc;


            return {
                tid,
                ...restTweetClean,
                userRetweet: retweets.map( retweet => {
                    if (retweet._id == id) {
                        return 'You Retweeted'
                    }else if (followings.find(userR => `${userR._id}` == `${retweet._id}`)) {
                        return `${retweet.name} Retweeted`
                    }else{
                        return '';
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
                   
        });   
        

        return res.status(200).json({
            ok: true,
            length: tweetsAndRetweets.length,
            data: tweetsAndRetweets
        })
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        })
    }


}

module.exports = {
    getTweetsAndRetweets,
    getTweetsByUserId,
    updateUser,
    addFollowAndUnfollow,
    getUserById,
    getUsers,
    getUserFollowers,
    getUserFollowing,
    getUsersRecomment
}