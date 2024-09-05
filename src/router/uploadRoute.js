const { Router } = require('express');
const { validateJWT } = require('../middlewares/validate-jwt');
const { 
    uploadImageCloudinary, 
    uploadImageCloudinaryUpdate, 
    updateUserBackgroundImage,
    updateUserImage
} = require('../controllers/uploadController');

const router = Router();

router.post('/image',[
    validateJWT,
], uploadImageCloudinary )

router.put('/image/:public_id',[
    validateJWT,
], uploadImageCloudinaryUpdate )

router.patch('/user/profile/image/:public_id',[
    validateJWT,
], updateUserImage )

router.patch('/user/background/image/:public_id',[
    validateJWT,
], updateUserBackgroundImage )

module.exports = router;