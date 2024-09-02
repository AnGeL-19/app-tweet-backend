const {response, request} = require('express');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const Comment = require('../models/comment');
const Hashtag = require('../models/hashtag');

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL );

const createTweet =  async ( req=request, res= response) => {

    const {description, privacity} = req.body;

    const { uid } = req.uid;

    const file  = req.files;
    
    try{
        

        let image_url = '';

        if (file) {
            const { tempFilePath } = file.fileImage

            const {secure_url} = await cloudinary.uploader.upload(tempFilePath);

            image_url = secure_url
        }

        const regex = /#\w+/g;

        const hashtags = description.match(regex);

        const accesibility = privacity ? true : privacity === 'public' ? true : false;

        const newTweet = new Tweet({
            userTweet: uid,
            description,
            imgTweet: image_url,
            showEveryone: accesibility
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
                    newTweet.hashtagsTweet.push(createHashtag._id); 

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

    const { idTweet } = req.params;
    const {uid} = req.uid;

    console.log(uid,idTweet);

    try {


        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])

        console.log(tweet);
        

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
                msg: 'quit liked',
                isLiked: false
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
                msg: 'liked',
                isLiked: true
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

    const { idTweet } = req.params;
    const { uid } = req.uid;

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
                msg: 'quit Retweet',
                isRetweeted: false
            })

        }else{
 
            const retweet = tweet.nRetweets + 1; 

            await Promise.all([
                tweet.updateOne({$push:{retweets: uid}}), // PUSH AGREGA UN ELEMENTO AL ARRAY
                user.updateOne({$push:{retweets: idTweet}}),
                tweet.updateOne({nRetweets: retweet})
            ])
            console.log("Agregado");

            res.status(200).json({
                ok: true,
                msg: 'added Retweet',
                isRetweeted: true
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

    const { idTweet } = req.params;
    const { uid } = req.uid;

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
                msg: 'quit Saved',
                isSaved: false
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
                msg: 'Saved',
                isSaved: true
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

    const { idTweet } = req.params;
    const { comment } = req.body;
    const { uid } = req.uid;
    const file  = req.files;

    try {

        let image_url = '';

        if (file) {
            const { tempFilePath } = file.fileImage

            const {secure_url} = await cloudinary.uploader.upload(tempFilePath);

            image_url = secure_url
        }

        
        const newCommet = new Comment({
            userComment: uid,
            tweetComment: idTweet,
            commentText: comment,
            imgComment: image_url
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
            },
            liked: false
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

    const { idComment } = req.params;
    const { uid } = req.uid;

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
                msg: 'quit liked',
                isLiked: false
            })
        }else{

            const like = commentUser.nLikes + 1; 
            await Promise.all([
                commentUser.updateOne({$push:{likes: uid}}),
                commentUser.updateOne({nLikes: like})
            ])

            return res.status(200).json({
                ok: true,
                msg: 'liked',
                isLiked: true
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
    const { limit = 5, page = 1 } = req.query;
    const { uid } = req.uid
    
    try {

        const commets = await Comment.find({tweetComment: idTweet},null,{ 
            sort: { nLikes : -1, _id: -1 },
            skip: (page - 1) * limit, // Starting Row
            limit: limit, // Ending Row
            populate: {path: 'userComment', select: '_id imgUser name' }
        })

        const commentTweets = commets.map(cmm => {
            const { ...rest } = cmm
            const { _id, likes, __v, ...restClean } = rest._doc
            return {
                cid: _id,
                ...restClean,
                liked: likes.includes(uid)
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