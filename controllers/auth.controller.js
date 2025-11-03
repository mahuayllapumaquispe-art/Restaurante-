const Usuario = require('../models/Usuario.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "mi-clave-secreta-para-el-restaurante-2025";

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const usuario = await Usuario.findByUsername(username);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado o inactivo" });
    }

    const esPasswordCorrecto = await bcrypt.compare(password, usuario.passwordHash);
    if (!esPasswordCorrecto) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const payload = {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
      piso: usuario.pisoAsignado 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '8h' 
    });
    
    res.status(200).json({
      message: `¡Bienvenido ${usuario.nombre}!`,
      token: token,
      rol: usuario.rol
    });

  } catch (error) {
    res.status(500).json({ message: "Error en el servidor al intentar loguear", error: error.message });
  }
};

module.exports = {
  login
};