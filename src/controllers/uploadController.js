const {response, request} = require('express');

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL );

const uploadImageCloudinary = async ( req=request, res= response ) => {
   
    try{

        const { tempFilePath }  = req.files.fileImage;

        // if(modelImage){
        //     // hay que borrar la imagen del servidor cloudinary

        //     const splitName =  modelo.img.split('/');
        //     const name = splitName[splitName.length - 1];
        //     const [ public_id ] = name.split('.');

        //     cloudinary.uploader.destroy(public_id);
            
        // }

        console.log(tempFilePath, 'entrooooo uploadImageCloudinary' );

        const {secure_url} = await cloudinary.uploader.upload(tempFilePath);

        return res.status(200).json({
            ok: true,
            url: secure_url
        });
    
    }catch(err){
        console.log(err);
        console.log('Error upload image');
        return res.status(500).json({
            ok: true,
            msg: 'Error upload image'
        });
    }
    
}

module.exports = {
    uploadImageCloudinary
}