const jwt = require('jsonwebtoken');

// =======================
// Verificar Token
// =======================

let verificaToken = (req, res, next) => {
    let token = req.get('token');
    console.log(token);

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();
    })
};



// =======================
// Verifica AdminRole
// =======================
let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no tiene un rol de Administrador',
                nombre_usuario: usuario.nombre,
                role: usuario.role
            }
        })
    }


};

// ===========================================
// Verifica Token Imagen
// ===========================================
let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }

        req.usuario = decoded.usuario;
        next();
    })
}



module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
};