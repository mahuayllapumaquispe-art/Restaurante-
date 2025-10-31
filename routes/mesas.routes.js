const express = require('express');
const router = express.Router();
const controller = require('../controllers/mesas.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

// Ver mesas: Mozo, Caja y Admin
router.get('/', 
  verificarToken, 
  verificarRol(["Mozo", "Caja", "Admin"]), 
  controller.obtenerTodasLasMesas
);

// Cambiar estado (ej: a 'libre'): Mozo y Admin
router.put('/:idMesa/estado', 
  verificarToken, 
  verificarRol(["Mozo", "Admin"]), 
  controller.cambiarEstadoMesa
);

module.exports = router;