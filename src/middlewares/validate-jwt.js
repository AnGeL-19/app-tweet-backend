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

const validationJWTSocket = (socket, next) => {
    try {

        const token = socket.handshake.headers['authorization'];
        if (token) {
            try {
              // Verifica el JWT o realiza la validación del token aquí
              const user = jwt.verify(token, process.env.JWT_KEY); // Verifica el JWT
              
              socket.userId = user.uid; // Guarda el ID del usuario en el socket

              next(); // Continúa con la conexión

            } catch (err) {
              next(new Error('Token invalid')); // Si hay un error, rechaza la conexión
            }
          } else {
            next(new Error('Token is necesary')); // Si no hay token, rechaza la conexión
          }
    } catch (error) {
        console.log(error);
        
    }
}

module.exports = {
    validateJWT,
    validationJWTSocket
};