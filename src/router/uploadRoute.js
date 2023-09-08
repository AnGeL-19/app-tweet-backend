const { Router } = require('express');
const { check } = require('express-validator');
const { validateJWT } = require('../middlewares/validate-jwt');
const { uploadImageCloudinary, uploadImageCloudinaryUpdate } = require('../controllers/uploadController');

const router = Router();

router.post('/image',[
    validateJWT,
], uploadImageCloudinary )

router.put('/image/:public_id',[
    validateJWT,
], uploadImageCloudinaryUpdate )

module.exports = router;