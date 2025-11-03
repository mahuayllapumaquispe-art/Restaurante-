const Usuario = require('../models/Usuario.js');
const bcrypt = require('bcryptjs');

const crearUsuario = async (req, res) => {
  try {
    const { nombre, username, password, rol, pisoAsignado } = req.body;

    if ((rol === 'Mozo' || rol === 'Caja') && !pisoAsignado) {
      return res.status(400).json({ message: "Mozo y Caja deben tener un piso asignado" });
    }
    if ((rol === 'Admin' || rol === 'Cocinero') && pisoAsignado) {

      req.body.pisoAsignado = null;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = {
      nombre,
      username,
      passwordHash, 
      rol,
      pisoAsignado: req.body.pisoAsignado || null
    };

    const id = await Usuario.create(nuevoUsuario);
    
    res.status(201).json({ message: "Usuario creado", id, nombre, username, rol });
    
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error: error.message });
  }
};

const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

module.exports = {
  crearUsuario,
  obtenerTodosLosUsuarios
};