const express = require('express');
const router = express.Router();
const controller = require('../controllers/kds.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

// 'Cocinero' y 'Admin' pueden ver las pantallas KDS
router.get('/:tipo', 
  verificarToken, 
  verificarRol(["Cocinero", "Admin"]), 
  controller.getPedidosPendientes
);

// 'Cocinero' y 'Admin' pueden actualizar el estado del pedido
router.put('/pedidos/:idPedido', 
  verificarToken, 
  verificarRol(["Cocinero", "Admin"]), 
  controller.cambiarEstadoPedidoKDS
);

module.exports = router;