const User = require('../models/user');

// verificar si el correo existe
const existEmail = async (email = '') => {
    const exist = await User.findOne({email});
    if (exist) {
        throw new Error('this email exist already');
    }
}

const existUser = async ( id ) => {
    const exist = await User.findById(id);
    if (!exist) {
        throw new Error(`id doesn't exist ${exist}`);
    }
}

module.exports = {
    existEmail,
    existUser
}