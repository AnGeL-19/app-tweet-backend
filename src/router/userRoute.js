const {Router } = require('express');
const { check } = require('express-validator');
const { addFollowAndUnfollow, getUserById, getUsers, getUserFollowers, getUserFollowing, getUsersRecomment, updateUser, getTweetsByUserId, getTweetsAndRetweets } = require('../controllers/userController');
const { validateJWT } = require('../middlewares/validate-jwt');
const { validInputs } = require('../middlewares/validate-inputs');

const router = Router();

router.put('/edit',[
    validateJWT,
], updateUser )

router.patch('/followUnfollow/:id', [
    validateJWT
] , addFollowAndUnfollow  );

router.get('/people', validateJWT , getUsers  );

router.get('/recomment',[
    validateJWT,
], getUsersRecomment )

router.get('/:id', validateJWT , getUserById  );

router.get('/followers/:id', validateJWT , getUserFollowers  );

router.get('/following/:id', validateJWT , getUserFollowing  );

router.get("/:id/tweets", [validateJWT], getTweetsByUserId);

module.exports = router;