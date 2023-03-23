const {response, request} = require('express');
const Tweet = require('../models/tweet');
const User = require('../models/user');
const Comment = require('../models/comment');
const Hashtag = require('../models/hashtag');

const createTweet =  async ( req=request, res= response) => {

    const {description, img, hashtags, privacity} = req.body;
    const {uid} = req;

    console.log(uid,description,img,hashtags, privacity,'si entra');

    try{

        let hashtag;

        const tweet = new Tweet({
            userTweet: uid,
            description,
            imgTweet: img, 
            showEveryone: privacity
        });

        console.log(tweet);

        console.log(hashtags, !!hashtags);

        if (!!hashtags) {
            console.log('amonos' );
            
            for (let index = 0; index < hashtags.length; index++) {
            
                const ht = await Hashtag.findOne({nameHashtag: hashtags[index]})
    
                if(hashtags[index]){
                    if (!ht) {
                        hashtag = new Hashtag({
                            nameHashtag: hashtags[index],
                            tweet: tweet._id 
                        }); 

                        hashtag.hashtagTweet.push(tweet._id);
                        
                        console.log(hashtag);

                        await hashtag.save()
                        tweet.hashtagsTweet.push(hashtag._id); 
        
                        console.log(tweet);
                        
                    }else{
                        const tweets = ht.nTweets + 1;
        
                        await Promise.all([
                            ht.updateOne({$push:{hashtagTweet: tweet._id}}),
                            ht.updateOne({nTweets: tweets})
                        ])
                    }    
                }
                
            } 
        }
        
        await Promise.all([
            User.findById(uid).updateOne({$push:{posts: tweet._id}}),
            tweet.save()
        ]);
                     
        return res.status(201).json({
            tweet
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
        res.status(500).json({
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

        console.log(tweet.likes);

        if(tweet.likes.includes(uid)){
            console.log("si esta el usuario");

            const dislike = tweet.nLikes - 1; 
            console.log(dislike, "unlike");

            await Promise.all([
                tweet.updateOne({$pull: {likes: uid}}),
                tweet.updateOne({nLikes: dislike}),
                user.updateOne({$pull: {likes: idTweet}}),

            ])
            // PULL SACA DEL ARRAY
            
            console.log("eliminado");

            res.status(200).json({
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
            console.log("Agregado");

            res.status(200).json({
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
        
        console.log(tweet.retweets, "retweets");
        console.log(user.retweets, "retweets");

        if(tweet.retweets.includes(uid)){
            console.log("si esta el usuario");

            const unRetweet = tweet.nRetweets - 1; 
            await Promise.all([
                tweet.updateOne({$pull: {retweets: uid}}), // PULL SACA DEL ARRAY
                user.updateOne({$pull: {retweets: idTweet}}),
                tweet.updateOne({nRetweets: unRetweet})
            ])
            
            console.log("eliminado");

            res.status(200).json({
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

    console.log(uid,idTweet);

    try {
        
        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])

        console.log(tweet.saved, "saved");
        console.log(user.saved, "saved");
        

        if(tweet.saved.includes(uid)){
            console.log("si esta el usuario");
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

            res.status(200).json({
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

    console.log(uid,idTweet,comment);

    try {
        
        const newCommet = new Comment({
            userComment: uid,
            tweetComment: idTweet,
            commentText: comment,
            imgComment: img
        })

        await Promise.all([
            Tweet.findById(idTweet).updateOne({$push:{comentPeople: newCommet._id}}),
            newCommet.save()
        ]);        

        return res.status(201).json({
            ok: true,
            newCommet
        })


    } catch (e) {
        console.log(e);
        res.status(500).json({
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
        
        // NOTA: BUSCAR USUARIO QUE YA TIENE LIKE Y ELIMINARLO
        const commentUser = await Comment.findById(idComment).populate();

        // const userLike = await commentUser;
        console.log(commentUser);
        // console.log(commentUser.likes);

        if(commentUser.likes.includes(uid)){
            console.log("si esta el usuario");
            const disLike = commentUser.nLikes - 1; 
            await Promise.all([
                commentUser.updateOne({$pull: {likes: uid}}),
                commentUser.updateOne({nLikes: disLike})
            ])
            // PULL SACA DEL ARRAY
            console.log("eliminado");

            return res.status(200).json({
                ok: true,
                msg: 'quit liked'
            })
        }else{
            console.log("no se encuentra el usuario");
            const like = commentUser.nLikes + 1; 
            await Promise.all([
                commentUser.updateOne({$push:{likes: uid}}),
                commentUser.updateOne({nLikes: like})
            ])
            console.log("Agregado");

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


module.exports = {
    createTweet,
    addMsgTweet,
    addLikeCommentTweet,
    addLikeTweet,
    addRetweetTweet,
    addSaveTweet,
    getTweet
}