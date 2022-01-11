const {Router } = require('express');
const { check } = require('express-validator');
const { createTweet } = require('../controllers/tweetController');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

// read toDo

router.post('/newTweet', validateJWT , createTweet );

// router.post('/', loginUser );

// router.get('/renew', [
//     validateJWT
// ],renewToken);


module.exports = router;