const {response, request} = require('express');
const bcrypt = require('bcryptjs');

const Tweet = require('../models/tweet');
const User = require('../models/user');

const getUsers = async (req = request, res) => {

    const {uid} = req;
    const { search = '', limit = 5, page = 1 } = req.query;

    try{

        const user = await User.findById(uid).select('following')

        const followings = user.following.map( f => {
            return {
                _id: f
            }
        })

        const users = await User.find({ 
            name : { $regex: `${search}` }, 
            $nor: [{_id: uid }, ...followings] },
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

    const {id} = req.params;

    try{

        const user = await User.findById(id);

        const {followers, following, ...rest} = user;
        const { _id: uid, ...restdata } = rest._doc

        if(user){

            return res.status(200).json({
                ok: true,
                data: {
                    uid,
                    ...restdata,
                    nfollowers: followers.length,
                    nfollowing: following.length
                }
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

    const {id} = req.params;
    const { limit = 5, page = 1 } = req.query;

    try{

        const users = await User.find({followers: id}).select('_id name bio imgUser followers')
                                .skip((page - 1) * limit)
                                .limit(limit)     


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

const getUserFollowing = async (req = request, res) => {

    const {id} = req.params;
    const { limit = 5, page = 1 } = req.query;

    try{

        const users = await User.find({following: id}).select('_id name bio imgUser followers')
                                .skip((page - 1) * limit)
                                .limit(limit)
        

        // const { following, _id } = user;
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

const addFollowAndUnfollow = async (req, res) => {


    const {id} = req.params;
    const {uid} = req;

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
                msg: 'Unfollow'
            })
        }else{
            await Promise.all([
                user.updateOne({$push: {following: id}}), // PUSH SACA DEL ARRAY
                userFollowing.updateOne({$push: {followers: uid}})
            ]);
            return res.status(200).json({
                ok:true,
                msg: 'Following'
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

    const {uid} = req;

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


    const {id} = req.params;
    const {limit = 5, page = 1, filter} = req.query;
    
    let objFilter;

    if (filter==='likes') {
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

        const tweetsUser = await Tweet.find({userTweet:id, showEveryone: true},
            null,
            {
                skip: (page - 1) * limit,
                limit: limit,
                ...objFilter
        })
        .populate({
            path: 'userTweet',
            select: '_id imgUser name followers',
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
        

        const tweets = tweetsUser.map(tweet => {
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
            })

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