const Usuario = require('../models/Usuario.js');
const bcrypt = require('bcryptjs');

// (RF14) Lo que llama el ADMIN para crear un empleado
const crearUsuario = async (req, res) => {
  try {
    const { nombre, username, password, rol, pisoAsignado } = req.body;

    // Validación de tu lógica de negocio
    if ((rol === 'Mozo' || rol === 'Caja') && !pisoAsignado) {
      return res.status(400).json({ message: "Mozo y Caja deben tener un piso asignado" });
    }
    if ((rol === 'Admin' || rol === 'Cocinero') && pisoAsignado) {
      // Si se envía un piso, lo ignoramos o seteamos a null
      req.body.pisoAsignado = null;
    }

    // 1. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Crear el objeto de usuario
    const nuevoUsuario = {
      nombre,
      username,
      passwordHash, // Guardamos el hash, no la contraseña
      rol,
      pisoAsignado: req.body.pisoAsignado || null
    };

    // 3. Guardar en la BD
    const id = await Usuario.create(nuevoUsuario);
    
    // 4. Responder (sin la contraseña)
    res.status(201).json({ message: "Usuario creado", id, nombre, username, rol });
    
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error: error.message });
  }
};

// Lo que llama el ADMIN para ver a todos los empleados
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