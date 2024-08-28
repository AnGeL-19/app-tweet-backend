const jwt =  require('jsonwebtoken');

const validateJWT = (req, res, next) => {

    try{

        const token = req.cookies.token;
        
        if(!token){
            return res.status(401).json({
                ok: false,
                msg: 'Unauthorized: No token provided'
            });
        }

        jwt.verify(token, process.env.JWT_KEY, (err, uid) => {

            if (err) {
              return res.status(403).json({ message: 'Forbidden: Invalid token' });
            }

            req.uid = uid;
             // Guardar la información del usuario en el request
            next();

        });

    }catch(err){

        return res.status(401).json({
            ok: false,
            msg: 'Token is not invalid'
        })

    }

}

module.exports = {validateJWT};