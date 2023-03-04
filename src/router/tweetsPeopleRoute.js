const {Router } = require('express');
const { check } = require('express-validator');

const { getTweetsFollowing, getTweetsPopular, getTweetsAndRetweets, getHashtags, getSearchHashtag, getTweetsByUserId, getTweetsSaved, getUsersRecomment, getTweetsSearch, getTweetsLiked } = require('../controllers/tweetsPeopleController');
const { validTweetExist, 
        validCommentExist } = require('../helpers/db-validationTweet');

const { validInputs, validParamHashtag } = require('../middlewares/validate-inputs');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/populates', [
    validateJWT,
] , getTweetsPopular ); 

router.get('/saved', [
    validateJWT,
] , getTweetsSaved );

router.get('/liked', [
    validateJWT,
] , getTweetsLiked );

router.get('/retweets/:uid', [
    validateJWT,
    check('uid', 'id is not mongoId').isMongoId(),
    check('uid', 'id is necesary').notEmpty(),
    validInputs
] , getTweetsAndRetweets ); 

router.get('/search', [
    validateJWT,
] , getTweetsSearch );

router.get('/hashtags',[
    validateJWT,
], getHashtags )


router.get('/hashtag/search',[
    validateJWT,
    validParamHashtag,
    validInputs
], getSearchHashtag )



router.get('/:id', [
    validateJWT,
] , getTweetsByUserId );

router.get('/', [
    validateJWT,
] , getTweetsFollowing );


module.exports = router;