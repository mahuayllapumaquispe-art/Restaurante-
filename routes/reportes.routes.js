const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportes.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

router.get('/hoy',
  verificarToken,
  verificarRol(["Admin"]), 
  controller.getReporteDelDia
);

module.exports = router;