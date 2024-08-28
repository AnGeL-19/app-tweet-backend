const {response, request} = require('express');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const Comment = require('../models/comment');
const Hashtag = require('../models/hashtag');

const createTweet =  async ( req=request, res= response) => {

    const {description, hashtags, privacity, img} = req.body;

    const { uid } = req.uid;

    console.log(uid, description, hashtags, privacity,'si entra');

    try{
        


        const newTweet = new Tweet({
            userTweet: uid,
            description,
            imgTweet: img,
            showEveryone: privacity
        });


        if (hashtags) {
            
            await hashtags.forEach( async (hashtag) => {

                const ht = await Hashtag.findOne({nameHashtag: hashtag})

                if (!ht) {
                    const createHashtag = new Hashtag({
                        nameHashtag: hashtag,
                        tweet: newTweet._id 
                    }); 

                    createHashtag.hashtagTweet.push(newTweet._id);
                    tweet.hashtagsTweet.push(createHashtag._id); 

                    await createHashtag.save()

                }else{
                    const numTweets = ht.nTweets + 1;
                    newTweet.hashtagsTweet.push(ht._id)

                    
                    await Promise.all([
                        ht.updateOne({$push:{hashtagTweet: newTweet._id}}),
                        ht.updateOne({nTweets: numTweets}), 
                    ])

                }    
                
            });

            await newTweet.save()
            await Tweet.findById(newTweet._id).updateOne({$push:{hashtagsTweet: newTweet.hashtagsTweet}})

        }else{
            await newTweet.save()
        }

        await User.findById(uid).updateOne({$push:{posts: newTweet._id}})
        
        const tweet = await Tweet.findById(newTweet._id).populate({
            path:'userTweet retweets', 
            select: '_id name imgUser'
        })

        const { userTweet ,...restTweet } = tweet;
        const { _id: tid, retweets, comentPeople, __v, ...restTweetClean } = restTweet._doc
        const { _id, ...restUser } = userTweet._doc;

        const formatTweet = {
            tid,
            ...restTweetClean,
            userRetweet: '',
            userTweet: {
                uid: _id,
                ...restUser
            }
        }

        return res.status(200).json({
            ok: true,
            msg: 'Tweet created success',
            tweet: formatTweet
        });

    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getTweet = async (req, res) => {

    const {id} = req.params;
    const {uid} = req;

    try{

        const tweet = await Tweet.findById(id).populate('userTweet', '_id name imgUser followers');

        const { ...restTweet } = tweet;
        const { userTweet, ...rtweet } = restTweet._doc;
        const {following,followers, ...rest} = userTweet._doc;
        // validar si lo tiene en seguidores

        if (rtweet.showEveryone) {
            
            return res.status(200).json({
                ok: true,
                tweet: {
                    userTweet: rest,
                    ...rtweet
                }
    
            })

        
        }else if(rtweet.showFollow){


            if (followers.includes(uid) || rest._id === uid) {
                return res.status(200).json({
                    ok: true,
                    tweet: {
                        userTweet: rest,
                        ...rtweet
                    }
                })

            }else{

                return res.status(200).json({
                    ok: true,
                    msg: 'you dont follow the user, the tweets is for followers only'
                })

            }

        }

    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }


}

const addLikeTweet = async (req, res) => {

    const {idTweet} = req.body;
    const {uid} = req;

    console.log(uid,idTweet);

    try {
        
        // NOTA: BUSCAR USUARIO QUE YA TIENE LIKE Y ELIMINARLO
        // const tweetUser = await Tweet.findById(idTweet).populate();

        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])


        if(tweet.likes.includes(uid)){

            const dislike = tweet.nLikes - 1; 

            await Promise.all([
                tweet.updateOne({$pull: {likes: uid}}),
                tweet.updateOne({nLikes: dislike}),
                user.updateOne({$pull: {likes: idTweet}}),

            ])
            // PULL SACA DEL ARRAY

            return res.status(200).json({
                ok: true,
                msg: 'quit liked'
            })

        }else{
            console.log("no se encuentra el usuario");
            const like = tweet.nLikes + 1; 
            console.log(like, "likes");
            
            await Promise.all([
                tweet.updateOne({$push: {likes: uid}}),
                tweet.updateOne({nLikes: like}),
                user.updateOne({$push: {likes: idTweet}}),

            ])
              // PUSH AGREGA UN ELEMENTO AL ARRAY

            return res.status(200).json({
                ok: true,
                msg: 'liked'
            })
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const addRetweetTweet = async (req, res) => {

    const {idTweet} = req.body;
    const {uid} = req;

    console.log(uid,idTweet);

    try {
        
        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])

        if(tweet.retweets.includes(uid)){

            const unRetweet = tweet.nRetweets - 1; 
            await Promise.all([
                tweet.updateOne({$pull: {retweets: uid}}), // PULL SACA DEL ARRAY
                user.updateOne({$pull: {retweets: idTweet}}),
                tweet.updateOne({nRetweets: unRetweet})
            ])

            return res.status(200).json({
                ok: true,
                msg: 'quit Retweet'
            })

        }else{
            console.log("no se encuentra el usuario");
            const retweet = tweet.nRetweets + 1; 

            await Promise.all([
                tweet.updateOne({$push:{retweets: uid}}), // PUSH AGREGA UN ELEMENTO AL ARRAY
                user.updateOne({$push:{retweets: idTweet}}),
                tweet.updateOne({nRetweets: retweet})
            ])
            console.log("Agregado");

            res.status(200).json({
                ok: true,
                msg: 'added Retweet'
            })
        }

        

    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const addSaveTweet = async (req, res) => {

    const {idTweet} = req.body;
    const {uid} = req;

    try {
        
        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])


        if(tweet.saved.includes(uid)){
            const unSaved = tweet.nSaved - 1; 

            await Promise.all([
                tweet.updateOne({$pull: {saved: uid}}),
                user.updateOne({$pull: {saved: idTweet}}),
                tweet.updateOne({nSaved: unSaved}),
            ])
             // PULL SACA DEL ARRAY
            console.log("eliminado");

            res.status(200).json({
                ok: true,
                msg: 'quit Saved'
            })

        }else{
            console.log("no se encuentra el usuario");
            const saved = tweet.nSaved + 1; 
            await Promise.all([
                tweet.updateOne({$push:{saved: uid}}),
                user.updateOne({$push: {saved: idTweet}}),
                tweet.updateOne({nSaved: saved}),
            ])
            // PUSH AGREGA UN ELEMENTO AL ARRAY
            console.log("Agregado");

            return res.status(200).json({
                ok: true,
                msg: 'Saved'
            })
        }


    } catch (e) {
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const addMsgTweet = async (req, res) => {

    const {idTweet, comment, img} = req.body;
    const {uid} = req;

    try {
        
        const newCommet = new Comment({
            userComment: uid,
            tweetComment: idTweet,
            commentText: comment,
            imgComment: img
        })

        const [tweet,user] = await Promise.all([
            Tweet.findById(idTweet), 
            User.findById(uid)
        ]); 

     
       

        const nComments = tweet.nComentPeople + 1

        await Promise.all([
            tweet.updateOne({
                $push:{comentPeople: newCommet._id}, 
                nComentPeople: nComments}
            ),
            newCommet.save()
        ]);        

        const { userComment, ...rest } = newCommet
        const { _id, __v, ...restDoc } = rest._doc

        const newCmmt = {
            cid: _id,
            ...restDoc,
            userComment: {
                uid: user._id,
                name: user.name,
                imgUser: user.imgUser
            }
        }

        console.log(tweet, user);
        

        return res.status(201).json({
            ok: true,
            comment: newCmmt
        })


    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const addLikeCommentTweet = async (req, res) => {

    const {idComment} = req.body;
    const {uid} = req;

    console.log(uid,idComment);

    try {
        
        const commentUser = await Comment.findById(idComment).populate();

        if(commentUser.likes.includes(uid)){
            console.log("si esta el usuario");
            const disLike = commentUser.nLikes - 1; 
            await Promise.all([
                commentUser.updateOne({$pull: {likes: uid}}),
                commentUser.updateOne({nLikes: disLike})
            ])

            return res.status(200).json({
                ok: true,
                msg: 'quit liked'
            })
        }else{

            const like = commentUser.nLikes + 1; 
            await Promise.all([
                commentUser.updateOne({$push:{likes: uid}}),
                commentUser.updateOne({nLikes: like})
            ])

            return res.status(200).json({
                ok: true,
                msg: 'liked'
            })
        }
        

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const getCommentsTweetById = async (req, res) => {

    const {id : idTweet} = req.params;
    const {limit = 5, page} = req.query;
    
    try {

        const commets = await Comment.find({tweetComment: idTweet},null,{ 
            skip: (page - 1) * limit, // Starting Row
            limit: limit, // Ending Row
            sort: { nLikes : -1 },
            populate: {path: 'userComment', select: '_id imgUser name' }
        })

        const commentTweets = commets.map(cmm => {
            const { ...rest } = cmm
            const { _id, __v, ...restClean } = rest._doc
            return {
                cid: _id,
                ...restClean
            }
        })

        return res.status(201).json({
            ok: true,
            comments: commentTweets
        })


    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

module.exports = {
    createTweet,
    addMsgTweet,
    addLikeCommentTweet,
    addLikeTweet,
    addRetweetTweet,
    addSaveTweet,
    getTweet,
    getCommentsTweetById
}