const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportes.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

// (RF12) Obtener el reporte del día
// GET /api/reportes/hoy
router.get('/hoy',
  verificarToken,
  verificarRol(["Admin"]), // <-- Solo el Admin puede ver reportes
  controller.getReporteDelDia
);

module.exports = router;