const express = require('express');
const router = express.Router();
const controller = require('../controllers/kds.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');
router.get('/:tipo', 
  verificarToken, 
  verificarRol(["Cocinero", "Admin"]), 
  controller.getPedidosPendientes
);
router.put('/pedidos/:idPedido', 
  verificarToken, 
  verificarRol(["Cocinero", "Admin"]), 
  controller.cambiarEstadoPedidoKDS
);

module.exports = router;