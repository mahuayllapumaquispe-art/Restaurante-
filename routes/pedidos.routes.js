const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidos.controller.js');
const { verificarToken, verificarRol, verificarPisoMozo } = require('../middlewares/auth.middleware.js');

router.post('/', 
  verificarToken, 
  verificarRol(["Mozo"]), 
  verificarPisoMozo,
  controller.crearPedido
);

router.get('/', 
  verificarToken, 
  verificarRol(["Admin", "Caja"]), 
  controller.obtenerTodosLosPedidos
);

router.get('/listos-para-entrega',
  verificarToken,
  verificarRol(["Mozo"]),
  controller.obtenerPedidosListos
);

router.put('/:id/estado', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.cambiarEstadoPedido
);

router.put('/:id/entregar',
  verificarToken,
  verificarRol(["Mozo"]),
  controller.marcarPedidoEntregado
);


router.put('/:id/cancelar',
  verificarToken,
  verificarRol(["Mozo", "Admin"]),
  controller.cancelarPedidoPorMozo
);


router.post('/limpieza-expirados', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.limpiarPedidosExpirados
);

module.exports = router;