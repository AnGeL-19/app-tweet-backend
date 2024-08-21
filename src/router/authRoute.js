const {Router} = require('express');
const { check } = require('express-validator');
const { 
    createUser, 
    loginUser, 
    renewToken
} = require('../controllers/authController');
const { existEmail } = require('../helpers/db-validationUser');
const { validInputs, validLoginUser } = require('../middlewares/validate-inputs');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();


router.get('/renew', [
    validateJWT
],renewToken);

router.post('/register', [
    check('name', 'name is necessary').notEmpty(),
    check('email', 'email is necessary').notEmpty(),
    check('email', 'this is not an email').isEmail(),
    check('email').custom(existEmail),
    check('password', 'password is necessary').notEmpty(),
    validInputs
] ,createUser );

router.post('/login', [
    check('email', 'email is necessary').notEmpty(),
    check('email', 'this is not an email').isEmail(),
    check('password', 'password is necessary').notEmpty(),
    validInputs,
    validLoginUser
] , loginUser );


module.exports = router;