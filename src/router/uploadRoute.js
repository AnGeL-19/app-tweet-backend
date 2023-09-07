const { Router } = require('express');
const { check } = require('express-validator');
const { validateJWT } = require('../middlewares/validate-jwt');
const { uploadImageCloudinary } = require('../controllers/uploadController');

const router = Router();

router.post('/image',[
    validateJWT,
], uploadImageCloudinary )

module.exports = router;