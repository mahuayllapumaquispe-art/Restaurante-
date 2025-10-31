const express = require('express');
const router = express.Router();
const controller = require('../controllers/caja.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

// Solo 'Caja' y 'Admin' pueden registrar un pago
router.post('/pagar', 
  verificarToken, 
  verificarRol(["Caja", "Admin"]), 
  controller.registrarPago
);

module.exports = router;