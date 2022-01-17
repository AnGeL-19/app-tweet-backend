const {response, request} = require('express');
const Tweet = require('../models/tweet');
const TweetsGlobal = require('../models/tweetsGlobal');
const User = require('../models/user');
const Comment = require('../models/comment');

const createTweet =  async ( req=request, res= response) => {

    const {description, img} = req.body;
    const {uid} = req;

    console.log(uid,description,img);

    try{

        const tweet = new Tweet({
            userTweet: uid,
            description,
            imgTweet: img, 
        });

        const tg = await TweetsGlobal.findOne({year: new Date(tweet.date).getFullYear() });

        if(!tg){
            const newYearPost = new TweetsGlobal({year: new Date().getFullYear()});    
            newYearPost.posts.push(tweet._id);

            await Promise.all([
                User.findById(uid).updateOne({$push:{posts: tweet._id}}),
                tweet.save(),
                newYearPost.save()
            ]);
            
        }else{
            await Promise.all([
                User.findById(uid).updateOne({$push:{posts: tweet._id}}),
                TweetsGlobal.findOne({year: new Date(tweet.date).getFullYear()}).updateOne({$push:{posts: tweet._id}}),
                tweet.save(),
            ]);
        }

        res.json({
            tweet
        });

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
        const tweetUser = await Tweet.findById(idTweet).populate();

        console.log(tweetUser.likes);

        if(tweetUser.likes.includes(uid)){
            console.log("si esta el usuario");
            await tweetUser.updateOne({$pull: {likes: uid}}); // PULL SACA DEL ARRAY
            console.log("eliminado");
        }else{
            console.log("no se encuentra el usuario");
            await tweetUser.updateOne({$push:{likes: uid}}); // PUSH AGREGA UN ELEMENTO AL ARRAY
            console.log("Agregado");
        }

        res.json({
            ok: true,
            msg: 'liked'
        })

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
        
        // NOTA: BUSCAR USUARIO QUE YA TIENE LIKE Y ELIMINARLO
        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])
        
        console.log(tweet.retweets, "retweets");
        console.log(user.retweets, "retweets");

        if(tweet.retweets.includes(uid)){
            console.log("si esta el usuario");
            await Promise.all([
                tweet.updateOne({$pull: {retweets: uid}}), // PULL SACA DEL ARRAY
                user.updateOne({$pull: {retweets: idTweet}})
            ])
            
            console.log("eliminado");

        }else{
            console.log("no se encuentra el usuario");

            await Promise.all([
                tweet.updateOne({$push:{retweets: uid}}), // PUSH AGREGA UN ELEMENTO AL ARRAY
                user.updateOne({$push:{retweets: idTweet}})
            ])
            console.log("Agregado");
        }

        res.json({
            ok: true,
            msg: 'Retweet'
        })

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
        
        // NOTA: BUSCAR USUARIO QUE YA TIENE LIKE Y ELIMINARLO
        const [tweet, user] = await Promise.all([
            Tweet.findById(idTweet).populate(),
            User.findById(uid).populate()
        ])

        console.log(tweet.saved, "saved");
        console.log(user.saved, "saved");
        

        if(tweet.saved.includes(uid)){
            console.log("si esta el usuario");

            await Promise.all([
                tweet.updateOne({$pull: {saved: uid}}),
                user.updateOne({$pull: {saved: idTweet}})
            ])
             // PULL SACA DEL ARRAY
            console.log("eliminado");
        }else{
            console.log("no se encuentra el usuario");
            await Promise.all([
                tweet.updateOne({$push:{saved: uid}}),
                user.updateOne({$push: {saved: idTweet}})
            ])
            // PUSH AGREGA UN ELEMENTO AL ARRAY
            console.log("Agregado");
        }

        res.json({
            ok: true,
            msg: 'Saved'
        })

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

        res.json({
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

        console.log(commentUser.likes);

        if(commentUser.likes.includes(uid)){
            console.log("si esta el usuario");
            await commentUser.updateOne({$pull: {likes: uid}}); // PULL SACA DEL ARRAY
            console.log("eliminado");
        }else{
            console.log("no se encuentra el usuario");
            await commentUser.updateOne({$push:{likes: uid}});
            console.log("Agregado");
        }

        res.json({
            ok: true,
            msg: 'liked'
        })

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
    addSaveTweet
}