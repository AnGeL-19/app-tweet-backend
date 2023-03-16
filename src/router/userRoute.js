const {Router } = require('express');
const { check } = require('express-validator');
const { addFollowAndUnfollow, getUserById, getUsers, getUserFollowers, getUserFollowing, getUsersRecomment, updateUser } = require('../controllers/userController');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.put('/edit',[
    validateJWT,
], updateUser )

router.put('/followUnfollow/:id', [
    validateJWT
] , addFollowAndUnfollow  );

router.get('/people', validateJWT , getUsers  );

router.get('/recomment',[
    validateJWT,
], getUsersRecomment )

router.get('/:id', validateJWT , getUserById  );

router.get('/followers/:id', validateJWT , getUserFollowers  );

router.get('/following/:id', validateJWT , getUserFollowing  );



module.exports = router;