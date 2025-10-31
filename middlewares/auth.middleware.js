const jwt = require('jsonwebtoken');

// (Esta debe ser la MISMA clave secreta que usaste en auth.controller.js)
const JWT_SECRET = "mi-clave-secreta-para-el-restaurante-2025";

// Middleware 1: Verifica si el Token es válido
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
    req.usuario = payload; // ej: req.usuario.rol, req.usuario.piso
    next();
    
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token inválido o expirado." });
    }
    res.status(500).json({ message: "Error interno al validar token", error: error.message });
  }
};

// Middleware 2: Verifica si el Rol es el correcto
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(501).json({ message: "Error de servidor: verificarToken debe usarse primero." });
    }

    const { rol } = req.usuario;

    if (rolesPermitidos.includes(rol)) {
      next(); // ¡Permitido! Continuar.
    } else {
      res.status(403).json({ message: `Acceso denegado. Rol '${rol}' no autorizado.` });
    }
  };
};

// --- ¡NUEVO MIDDLEWARE! ---
// Middleware 3: Verifica si el Mozo está en su piso correcto
const verificarPisoMozo = (req, res, next) => {
  const { rol, piso } = req.usuario; // Piso del Mozo (ej: 2)
  const { mesaId } = req.body; // Mesa del pedido (ej: "P1-M05")

  // Si no es un Mozo, no aplicamos esta regla
  if (rol !== 'Mozo') {
    return next();
  }

  // Si es Mozo, verificamos
  if (!mesaId) {
    return res.status(400).json({ message: "Falta el ID de la mesa (mesaId) en el body." });
  }

  // Extraemos el número de piso del ID de la mesa ("P1-M05" -> 1)
  const pisoMesa = parseInt(mesaId.split('-')[0].replace('P', ''));

  if (piso === pisoMesa) {
    next(); // ¡Correcto! El mozo está en su piso.
  } else {
    res.status(403).json({ message: `Acceso denegado. El Mozo del piso ${piso} no puede atender la mesa ${mesaId} del piso ${pisoMesa}.` });
  }
};


module.exports = {
  verificarToken,
  verificarRol,
  verificarPisoMozo // ¡Exportamos el nuevo!
};