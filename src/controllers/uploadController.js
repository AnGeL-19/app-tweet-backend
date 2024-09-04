const {response, request} = require('express');
const User = require('../models/user');
const { getUrlPublicId } = require('../helpers/getPublicId');

const cloudinary = require('cloudinary').v2
cloudinary.config( process.env.CLOUDINARY_URL );

const updateUserBackgroundImage = async (req = request, res) => {

    const { uid } = req.uid;
    const { public_id } = req.params;
    const { tempFilePath }  = req.files.fileImage;

    try{

        const userImage = await User.findById(uid).select('_id imgUserBackground');

        const url = getUrlPublicId(userImage.imgUserBackground)

        if( url !== public_id ){
            await cloudinary.uploader.destroy(public_id);
        } 

        // console.log(tempFilePath, 'entrooooo uploadImageCloudinary' );
        const {secure_url} = await cloudinary.uploader.upload(tempFilePath);
   
        const user = await User.findByIdAndUpdate(uid, {
            imgUserBackground: secure_url
        }, { new: true });

        if(user){

            return res.status(200).json({
                ok: true,
                msg: 'Update succesful Image',
                url: secure_url
            })

        }else{
            return res.status(204).json({
                ok: false,
                msg: 'User not found',
                url: null
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const updateUserImage = async (req = request, res) => {

    const { uid } = req.uid;
    const { public_id } = req.params;
    const { tempFilePath }  = req.files.fileImage;

    try{
        
        const userImage = await User.findById(uid).select('_id imgUserBackground');

        const url = getUrlPublicId(userImage.imgUserBackground)

        if( url !== public_id ){
            await cloudinary.uploader.destroy(public_id);
        } 


        const {secure_url} = await cloudinary.uploader.upload(tempFilePath);
        
        const user = await User.findByIdAndUpdate(uid, {
            imgUser: secure_url
        }, { new: true });

        if(user){

            return res.status(200).json({
                ok: true,
                msg: 'Update succesful Image',
                url: secure_url
            })

        }else{
            return res.status(204).json({
                ok: false,
                msg: 'User not found',
                url: null
            })
        }


    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const uploadImageCloudinary = async ( req=request, res= response ) => {
   
    try{

        const { tempFilePath }  = req.files.fileImage;

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

const uploadImageCloudinaryUpdate = async ( req=request, res= response ) => {

    const { public_id } = req.params;
    // https://res.cloudinary.com/dajit1a8r/image/upload/v1725309924/gelln0ujx1hxqkykk32m.png
    // SACAR EL ID PUBLIC
    // gelln0ujx1hxqkykk32m

    try{

        const { tempFilePath }  = req.files.fileImage;

        if(public_id){
            // hay que borrar la imagen del servidor cloudinary

            console.log(public_id);
            cloudinary.uploader.destroy(public_id);
            
        }

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
    uploadImageCloudinary,
    uploadImageCloudinaryUpdate,
    updateUserBackgroundImage,
    updateUserImage
}