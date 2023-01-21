const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require('../models/user');

const validInputs = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            ok:false,
            errors: errors.mapped()
        });
    }
    next();
}

const validLoginUser = async (req, res, next) => {

    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            msg: 'User / Password are not valid'
        })
    }        

    // Vereficar la constraseña
    const validPassword = bcryptjs.compareSync(password, user.password);
    if(!validPassword){
        return res.status(400).json({
            msg: 'User / Password are not valid'
        });
    }

    next();

}

const validParamHashtag = async (req, res, next) => {

    const {hashtag} = req.query;

    if(!hashtag){
        return res.status(400).json({
            error: 'Error!, Hashtag is required'
        })
    }    
    if(!hashtag.includes('#')){
        return res.status(400).json({
            error: 'Error!, Hashtag no include #'
        })
        
    }      

    next();

}





module.exports = { 
    validInputs,
    validLoginUser,
    validParamHashtag
};