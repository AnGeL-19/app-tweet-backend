const {Router } = require('express');
const { check } = require('express-validator');
const { addFollowAndUnfollow, getUserById, getUsers, getUserFollowers, getUserFollowing } = require('../controllers/userController');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();


router.put('/followUnfollow/:id', [
    validateJWT
] , addFollowAndUnfollow  );

router.get('/:id', validateJWT , getUserById  );

router.get('/', validateJWT , getUsers  );

router.get('/followers/:id', validateJWT , getUserFollowers  );

router.get('/following/:id', validateJWT , getUserFollowing  );

module.exports = router;