const {response, request} = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateJWT, checkJWT } = require('../helpers/jwt');


const createUser =  async ( req=request, res= response) => {

    const {name, password, email} = req.body;

    try{

        const exitEmail = await User.findOne({email});
        if(exitEmail){
            return res.status(400).json({
                ok: false,
                msg: 'This email exists'
            });
        }

        const user = new User({
            name,
            email,
            password
        });

        // encrypt password
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);

        // save user
        await user.save();

        // generate JWT
        const token = await generateJWT(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Asegúrate de estar usando HTTPS
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000 // Expira en 1 día
        });

        return res.status(200).json({
            ok: true,
            data: user,
            token
        });

    }catch(e){
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const loginUser =  async ( req=request, res= response) => {

    const {email, password:psw} = req.body;

    try{

        const user =  await User.findOne({email});
                            //   .populate({path: 'groups', select: '_id name'});
        if(!user){
            return res.status(400).json({
                ok: false,
                msg: 'Invalid Email or Password'
            });
        }

        // Validar el password
        const validPassword = bcrypt.compareSync(psw, user.password);
        if(!validPassword){
            return res.status(404).json({
                ok: false,
                msg: 'Invalid Email or Password'
            });
        }

        const {followers ,following, ...rest} = user;
        const { _id: uid ,password, __v, ...restdata } = rest._doc
        // generate JWT
        const token = await generateJWT(user.id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Asegúrate de estar usando HTTPS
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000 // Expira en 1 día
        });

        return res.status(200).json({
            ok: true,
            data: {
                uid,
                ...restdata,
                nfollowers: followers.length,
                nfollowing: following.length
            },
            token
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const checkToken = async (req = request, res = response) => {

    const { uid: id } = req.uid

    try{
        
        const userDB =  await User.findById(id);
    
        if (!userDB) return res.status(404).json({ok: false, msg: 'User not found'});

        const {followers, following , ...rest} = userDB;
        const { _id: uid, password, __v ,...restdata } = rest._doc

        const token = req.cookies.token;
        
        return res.status(200).json({
            ok: true,
            data: {
                uid,
                ...restdata,
                nfollowers: followers.length,
                nfollowing: following.length
            },
            token
        });

    }catch(err){
        console.log(err);
        res.status(404).json({
            ok: false,
            msg: 'error renew token'
        });
    }    

}

const logout = async (req = request, res = response) => {

    try{

        res.cookie('token', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
        });

        res.clearCookie('token');
        
        return res.status(200).json({
            ok: true,
            msg: 'Logout successful'
        });

    }catch(err){
        console.log(err);
        return res.status(404).json({
            ok: false,
            msg: 'error logout token'
        });
    }    

}



module.exports = {
    createUser,
    loginUser,
    checkToken,
    logout
}