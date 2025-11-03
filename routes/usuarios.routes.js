const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller.js');

const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

router.post('/', 
  verificarToken, 
  verificarRol(["Admin"]),
  controller.crearUsuario
);

router.get('/', 
  verificarToken, 
  verificarRol(["Admin"]),
  controller.obtenerTodosLosUsuarios
);

module.exports = router;
