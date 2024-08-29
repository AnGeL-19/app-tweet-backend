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
    check('hashtags','hashtags is not array').isArray().optional(),
    check('img','img is not string').isString().optional(),
    check('privacity','privacity is not boolean').isBoolean().optional(), 
    validInputs
] , createTweet );

router.get('/:id', [
    validateJWT,
] , getTweet );

router.get('/:id/comments', [
    validateJWT,
] , getCommentsTweetById );

router.put('/:idTweet/like', [
    validateJWT,
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    validInputs,  
], addLikeTweet );

router.put('/:idTweet/retweet', [
    validateJWT,
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    validInputs
] , addRetweetTweet );

router.put('/:idTweet/save', [
    validateJWT,
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    validInputs
], addSaveTweet );

router.post('/:idTweet/comment', [
    validateJWT,
    check('idTweet','idTweet is not mongoId').isMongoId(),
    check('idTweet').custom(validTweetExist),
    check('comment','comment is necessary').notEmpty(),
    validInputs
] , addMsgTweet );

router.put('/:idComment/like-comment', [
    validateJWT,
    check('idComment','idComment is not mongoId').isMongoId(),
    check('idComment').custom(validCommentExist),
    validInputs
] , addLikeCommentTweet );


module.exports = router;