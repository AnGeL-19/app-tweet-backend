const {response, request} = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateJWT } = require('../helpers/jwt');

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

        const user = new User({name,email,password});

        // encrypt password
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);

        // save user
        await user.save();

        // generate JWT
        const token = await generateJWT(user.id);

        res.json({
            ok: true,
            user,
            token
        });

    }catch(e){
        console.log(e);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}


const loginUser =  async ( req=request, res= response) => {

    const {email, password} = req.body;

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
        const validPassword = bcrypt.compareSync(password, user.password);
        if(!validPassword){
            return res.status(404).json({
                ok: false,
                msg: 'Invalid Email or Password'
            });
        }

        // generate JWT
        const token = await generateJWT(user.id);

        res.json({
            ok: true,
            user: user,
            token
        });

    }catch(err){
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Error, talk to the admin'
        });
    }

}

const renewToken = async (req = request, res = response) => {

    const { uid } = req;
    
    try{
        const token = await generateJWT(uid);

        const userDB =  await User.findById(uid);
        // .populate({path: 'groups', select: '_id name'});
    
        res.json({
            ok: true,
            user: userDB,
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

module.exports = {
    createUser,
    loginUser,
    renewToken
}