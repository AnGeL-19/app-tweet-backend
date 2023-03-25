const {Router } = require('express');
const { check } = require('express-validator');
const { createTweet, 
        addMsgTweet, 
        addLikeCommentTweet, 
        addLikeTweet, 
        addRetweetTweet, 
        addSaveTweet, 
        getTweet,
        getCommentsTweetById
    } = require('../controllers/tweetController');
const { validTweetExist, 
        validCommentExist } = require('../helpers/db-validationTweet');
const { validInputs } = require('../middlewares/validate-inputs');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();


router.post('/', [
    validateJWT,
    check('description','description is necessary').notEmpty(),
    check('description','description is not string').isString(),
    check('hashtags','hashtags is not string').isArray().optional(),
    check('img','img is not string').isString().optional(),
    check('privacity','img is not string').isBoolean().optional(), 
    validInputs
] , createTweet );

router.get('/:id', [
    validateJWT,
] , getTweet );

router.get('/:id/comments', [
    validateJWT,
] , getCommentsTweetById );

router.put('/like', [
    validateJWT,
    check('idTweet','idTweet is necessary').notEmpty(),
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    validInputs,  
], addLikeTweet );

router.put('/retweet', [
    validateJWT,
    check('idTweet','idTweet is necessary').notEmpty(),
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    validInputs
] , addRetweetTweet );

router.put('/save', [
    validateJWT,
    check('idTweet','idTweet is necessary').notEmpty(),
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    validInputs
], addSaveTweet );

router.post('/msg', [
    validateJWT,
    check('idTweet','idTweet is necessary').notEmpty(),
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    check('comment','comment is necessary').notEmpty(),
    validInputs
] , addMsgTweet );

router.put('/likeCmmt', [
    validateJWT,
    check('idComment','idTweet is necessary').notEmpty(),
    check('idComment','idTweet is not mongoId').isMongoId(),
    check('idComment').custom(validCommentExist),
    validInputs
] , addLikeCommentTweet );


module.exports = router;