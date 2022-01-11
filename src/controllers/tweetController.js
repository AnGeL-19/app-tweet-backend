const {response, request} = require('express');
const Tweet = require('../models/tweet');

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

        await tweet.save();

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


module.exports = {
    createTweet,
}