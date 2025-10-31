const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller.js');

// Importamos nuestros middlewares
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

// Ahora, pasamos los middlewares ANTES del controlador.
// El flujo será: Petición -> verificarToken -> verificarRol("Admin") -> controller

// POST /api/usuarios (Crea un usuario)
router.post('/', 
  verificarToken, 
  verificarRol(["Admin"]), // Solo el Admin puede crear
  controller.crearUsuario
);

// GET /api/usuarios (Obtiene todos)
router.get('/', 
  verificarToken, 
  verificarRol(["Admin"]), // Solo el Admin puede ver
  controller.obtenerTodosLosUsuarios
);

module.exports = router;