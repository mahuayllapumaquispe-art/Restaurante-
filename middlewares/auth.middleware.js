const jwt = require('jsonwebtoken');
const JWT_SECRET = "mi-clave-secreta-para-el-restaurante-2025";
const verificarToken = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: "Acceso denegado. No se proporcionó token." });
    }

    const token = header.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: "Formato de token inválido." });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload; 
    next();
    
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token inválido o expirado." });
    }
    res.status(500).json({ message: "Error interno al validar token", error: error.message });
  }
};


const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(501).json({ message: "Error de servidor: verificarToken debe usarse primero." });
    }

    const { rol } = req.usuario;

    if (rolesPermitidos.includes(rol)) {
      next(); 
    } else {
      res.status(403).json({ message: `Acceso denegado. Rol '${rol}' no autorizado.` });
    }
  };
};

const verificarPisoMozo = (req, res, next) => {
  const { rol, piso } = req.usuario; 
  const { mesaId } = req.body; 

  if (rol !== 'Mozo') {
    return next();
  }

  if (!mesaId) {
    return res.status(400).json({ message: "Falta el ID de la mesa (mesaId) en el body." });
  }

  const pisoMesa = parseInt(mesaId.split('-')[0].replace('P', ''));

  if (piso === pisoMesa) {
    next(); 
  } else {
    res.status(403).json({ message: `Acceso denegado. El Mozo del piso ${piso} no puede atender la mesa ${mesaId} del piso ${pisoMesa}.` });
  }
};


module.exports = {
  verificarToken,
  verificarRol,
  verificarPisoMozo 
};