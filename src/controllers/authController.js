const {response, request} = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateJWT } = require('../helpers/jwt');
const { googleVerify } = require('../helpers/google-verify');

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

const renewToken = async (req = request, res = response) => {

    const { uid: id } = req;

    try{
        const token = await generateJWT(id);

        const userDB =  await User.findById(id);

        const {followers, following , ...rest} = userDB;
        const { _id: uid, password, __v ,...restdata } = rest._doc
        
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

const googleSignIn = async (req=request, res= response) => {

    const { id_token } = req.body;

    try {
        
        const { email, name, picture } = await googleVerify(id_token);

        const user = await User.findOne({email});

        if(!user){

            const data = {
                email, 
                name, 
                imgUser: picture,
                password: '<dev>', 
                loginGoogle: true
            }
            const newUser = new User(data);

            const salt = bcrypt.genSaltSync();
            newUser.password = bcrypt.hashSync(data.password, salt);

            await newUser.save();

            const token = await generateJWT(newUser.id)

            res.status(200).json({
                ok: true,
                user:newUser,
                token
            })

        }else{
           
            if(user.loginGoogle){
                const token = await generateJWT(user.id)
                res.status(200).json({
                    ok: true,
                    user,
                    token
                })
            }else{
                res.status(401).json({
                    ok: false,
                    msg: 'error. User not logged in Google account',             
                })
            }
            
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({
            ok: false,
            msg: 'error signing in. The token could not be verified'
        })

    }

    

}


module.exports = {
    createUser,
    loginUser,
    renewToken,
    googleSignIn
}