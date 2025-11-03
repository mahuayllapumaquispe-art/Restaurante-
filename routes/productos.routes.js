const express = require('express');
const router = express.Router();
const controller = require('../controllers/productos.controller.js');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware.js');

router.get('/stock-bajo',
  verificarToken,
  verificarRol(["Admin"]),
  controller.obtenerStockBajo
);

router.get('/', controller.obtenerTodosLosProductos);
router.get('/:id', controller.obtenerProductoPorId);

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