const {Router } = require('express');
const { check } = require('express-validator');

const { getTweetsFollowing, getTweetsPopular, getTweetsAndRetweets, getHashtags, getSearchHashtag, getTweetsByUserId, getTweetsSaved } = require('../controllers/tweetsPeopleController');
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

router.get('/retweets/:uid', [
    validateJWT,
    check('uid', 'id is not mongoId').isMongoId(),
    check('uid', 'id is necesary').notEmpty(),
    validInputs
] , getTweetsAndRetweets ); 


router.get('/hashtag',[
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