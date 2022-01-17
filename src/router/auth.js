const {Router} = require('express');
const { check } = require('express-validator');
const { createUser, loginUser, renewToken } = require('../controllers/authController');
const { validateJWT } = require('../middlewares/validate-jwt');

const router = Router();

// read toDo

router.post('/new', createUser );

router.post('/', loginUser );

router.get('/renew', [
    validateJWT
],renewToken);


module.exports = router;