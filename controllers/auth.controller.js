const Usuario = require('../models/Usuario.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// (Esta debe ser tu clave secreta)
const JWT_SECRET = "mi-clave-secreta-para-el-restaurante-2025";

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Buscar al usuario por username
    const usuario = await Usuario.findByUsername(username);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    // 2. Comparar la contraseña enviada con el hash guardado
    const esPasswordCorrecto = await bcrypt.compare(password, usuario.passwordHash);
    if (!esPasswordCorrecto) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 3. ¡Login exitoso! Crear un Token
    const payload = {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      piso: usuario.pisoAsignado // Incluimos el piso del mozo/caja
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '8h' // El token expira en 8 horas
    });
    
    // 4. Enviar el token al cliente
    res.status(200).json({
      message: `¡Bienvenido ${usuario.nombre}!`,
      token: token,
      rol: usuario.rol
    });

  } catch (error) {
    res.status(500).json({ message: "Error en el servidor al intentar loguear", error: error.message });
  }
};

// ¡AQUÍ ESTÁ LA PARTE IMPORTANTE!
// Asegúrate de que esta sección exista al final.
module.exports = {
  login
};