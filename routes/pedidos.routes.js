const express = require('express');
const router = express.Router();
const controller = require('../controllers/pedidos.controller.js');
const { verificarToken, verificarRol, verificarPisoMozo } = require('../middlewares/auth.middleware.js');

// (C)REATE: Solo Mozos, y solo en su piso
router.post('/', 
  verificarToken, 
  verificarRol(["Mozo"]), 
  verificarPisoMozo,
  controller.crearPedido
);

// (R)EAD: Admin y Caja pueden ver todos los pedidos
router.get('/', 
  verificarToken, 
  verificarRol(["Admin", "Caja"]), 
  controller.obtenerTodosLosPedidos
);

// (R)EAD: Mozo ve sus pedidos listos para recoger
router.get('/listos-para-entrega',
  verificarToken,
  verificarRol(["Mozo"]),
  controller.obtenerPedidosListos
);

// (U)PDATE: Solo Admin puede cambiar estado manualmente (ej: /estado)
router.put('/:id/estado', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.cambiarEstadoPedido
);

// (U)PDATE: Mozo marca pedido como "entregado"
router.put('/:id/entregar',
  verificarToken,
  verificarRol(["Mozo"]),
  controller.marcarPedidoEntregado
);

// --- ¡NUEVA RUTA! (Cancelar Pedido) ---
// (U)PDATE: Mozo o Admin cancelan un pedido pendiente
router.put('/:id/cancelar',
  verificarToken,
  verificarRol(["Mozo", "Admin"]),
  controller.cancelarPedidoPorMozo
);

// Limpieza de expirados: Solo Admin
router.post('/limpieza-expirados', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.limpiarPedidosExpirados
);

module.exports = router;