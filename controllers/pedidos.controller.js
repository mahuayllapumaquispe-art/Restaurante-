const Pedido = require('../models/Pedido.js');
const Mesa = require('../models/Mesa.js'); 
const Producto = require('../models/Producto.js');

// (RF02) Crear Pedido
const crearPedido = async (req, res) => {
  try {
    const { mesaId, items } = req.body;
    const { id: mozoId } = req.usuario;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "El pedido no puede estar vacío" });
    }

    const pisoMesa = parseInt(mesaId.split('-')[0].replace('P', ''));
    if (isNaN(pisoMesa)) {
      return res.status(400).json({ message: "El ID de la mesa (mesaId) tiene un formato incorrecto." });
    }

    let itemsCompletos = [];
    let destinos = new Set(); 

    for (const item of items) {
      const productoDoc = await Producto.getById(item.productoId);
      
      if (productoDoc.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para: ${productoDoc.nombre}`);
      }
      
      itemsCompletos.push({ ...item, tipo: productoDoc.tipo });
      destinos.add(productoDoc.tipo);
    }

    const nuevoPedido = await Pedido.create({ 
      mesaId, mozoId, piso: pisoMesa, 
      items: itemsCompletos,
      destinos: Array.from(destinos)
    });

    await Mesa.updateEstado(mesaId, "ocupada");

    res.status(201).json(nuevoPedido);
    
  } catch (error) {
    if (error.message.includes("Stock insuficiente")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Producto no encontrado")) {
      return res.status(404).json({ message: "Uno de los productos no existe", error: error.message });
    }
    res.status(500).json({ message: "Error al crear el pedido", error: error.message });
  }
};

// (RF12) Obtener Todos los Pedidos
const obtenerTodosLosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.getAll();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error: error.message });
  }
};

// (Admin/Caja/Cocina) Cambiar Estado
const cambiarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; 

    const estadosValidos = ['pagado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado no válido" });
    }

    await Pedido.updateEstado(id, estado);
    res.status(200).json({ message: `Pedido ${id} actualizado a ${estado}` });
    
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado", error: error.message });
  }
};

// (Admin) Limpiar Pedidos Expirados
const limpiarPedidosExpirados = async (req, res) => {
  try {
    const cantidad = await Pedido.cancelarExpirados();
    res.status(200).json({ message: "Limpieza completada.", pedidosCancelados: cantidad });
    
  } catch (error) {
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice."});
    }
    res.status(500).json({ message: "Error en el servidor al limpiar pedidos", error: error.message });
  }
};

// (RF09) Mozo - Obtener Pedidos Listos
const obtenerPedidosListos = async (req, res) => {
  try {
    const { piso } = req.usuario;
    const pedidos = await Pedido.getPedidosListosPorPiso(piso);
    res.status(200).json(pedidos);

  } catch (error) {
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice." });
    }
    res.status(500).json({ message: "Error al obtener pedidos listos", error: error.message });
  }
};

// (RF09) Mozo - Marcar Pedido Entregado
const marcarPedidoEntregado = async (req, res) => {
  try {
    const { id } = req.params;
    await Pedido.updateEstado(id, "entregado");
    res.status(200).json({ message: `Pedido ${id} marcado como 'entregado'` });
    
  } catch (error) {
    res.status(500).json({ message: "Error al marcar como entregado", error: error.message });
  }
};


// --- ¡NUEVA FUNCIÓN! (Cancelar Pedido) ---
// (Mozo/Admin) Cancela un pedido PENDIENTE
const cancelarPedidoPorMozo = async (req, res) => {
  try {
    const { id } = req.params; // ID del pedido a cancelar

    // 1. Cancelamos el pedido
    // Esta función nos devuelve el mesaId si tiene éxito
    const mesaId = await Pedido.cancelarPedido(id);

    // 2. Verificamos si la mesa se debe liberar
    const seLibero = await Mesa.verificarYLiberarMesa(mesaId);
    
    let message = `Pedido ${id} cancelado.`;
    if (seLibero) {
      message += ` La mesa ${mesaId} ha sido liberada.`;
    } else {
      message += ` La mesa ${mesaId} sigue ocupada (tiene otros pedidos).`;
    }

    res.status(200).json({ message });

  } catch (error) {
    // Si el pedido no se puede cancelar (ej: ya está 'pagado')
    if (error.message.includes("No se puede cancelar")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Pedido no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice." });
    }
    res.status(500).json({ message: "Error al cancelar pedido", error: error.message });
  }
};


// Exportamos todo
module.exports = {
  crearPedido,
  obtenerTodosLosPedidos,
  cambiarEstadoPedido,
  limpiarPedidosExpirados,
  obtenerPedidosListos,
  marcarPedidoEntregado,
  cancelarPedidoPorMozo // <-- AÑADIDA
};