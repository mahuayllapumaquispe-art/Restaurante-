const express = require('express');
const router = express.Router();
const controller = require('../controllers/caja.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');
router.post('/pagar', 
  verificarToken, 
  verificarRol(["Caja", "Admin"]), 
  controller.registrarPago
);
router.post('/cancelar-ticket',
  verificarToken,
  verificarRol(["Caja", "Admin"]),
  controller.cancelarTicket
);

module.exports = router;