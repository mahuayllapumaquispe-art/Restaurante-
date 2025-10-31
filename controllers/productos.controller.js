const Producto = require('../models/Producto.js');

// (RF13) Crear Producto
const crearProducto = async (req, res) => {
  try {
    const nuevoProductoId = await Producto.create(req.body);
    res.status(201).json({ id: nuevoProductoId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: "Error al crear producto", error: error.message });
  }
};

// Obtener Todos los Productos (para el menú)
const obtenerTodosLosProductos = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error: error.message });
  }
};

// Obtener Producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.getById(id);
    res.status(200).json(producto);
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(500).json({ message: "Error al obtener producto", error: error.message });
  }
};

// (RF13) Actualizar Producto
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Producto.update(id, data);
    res.status(200).json({ message: "Producto actualizado", id, ...data });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar producto", error: error.message });
  }
};

// (RF13) Eliminar Producto
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.remove(id);
    res.status(200).json({ message: "Producto eliminado", id });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error: error.message });
  }
};

// --- ¡NUEVA FUNCIÓN! (RF11 - Alerta) ---
// Obtener productos con stock bajo (para el Admin)
const obtenerStockBajo = async (req, res) => {
  try {
    // Permitimos que el Admin defina el umbral en la URL (ej: /stock-bajo?umbral=20)
    // Si no lo define, usamos 10 por defecto.
    const umbral = parseInt(req.query.umbral) || 10;
    
    const productos = await Producto.getStockBajo(umbral);
    
    res.status(200).json(productos);

  } catch (error) {
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice para 'stock'." });
    }
    res.status(500).json({ message: "Error al obtener productos con stock bajo", error: error.message });
  }
};


module.exports = {
  crearProducto,
  obtenerTodosLosProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  obtenerStockBajo // <-- AÑADIDA
};