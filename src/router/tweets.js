const {Router } = require('express');
const { check } = require('express-validator');
const { createTweet, addMsgTweet, addLikeCommentTweet, addLikeTweet, addRetweetTweet, addSaveTweet } = require('../controllers/tweetController');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

// read toDo

router.post('/newTweet', validateJWT , createTweet );
router.post('/likeTweet', validateJWT , addLikeTweet );
router.post('/retweetTweet', validateJWT , addRetweetTweet );
router.post('/saveTweet', validateJWT , addSaveTweet );

router.post('/addMsgTweet', validateJWT , addMsgTweet );
router.post('/likeComment', validateJWT , addLikeCommentTweet );

// router.post('/', loginUser );

// router.get('/renew', [
//     validateJWT
// ],renewToken);


module.exports = router;