const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

// --- ¡NUEVA RUTA! (RF11 - Alerta) ---
// GET /api/productos/stock-bajo (Protegida para Admin)
router.get('/stock-bajo',
  verificarToken,
  verificarRol(["Admin"]),
  controller.obtenerStockBajo
);

// Todos pueden ver el menú (GET)
// (Estas deben ir DESPUÉS de /stock-bajo para que no haya conflicto)
router.get('/', controller.obtenerTodosLosProductos);
router.get('/:id', controller.obtenerProductoPorId);

// --- Solo Admin puede Crear, Actualizar o Eliminar productos ---
router.post('/', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.crearProducto
);

router.put('/:id', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.actualizarProducto
);

router.delete('/:id', 
  verificarToken, 
  verificarRol(["Admin"]), 
  controller.eliminarProducto
);

module.exports = router;