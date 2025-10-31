const Pedido = require('../models/Pedido.js');

// (RF07) Obtener pedidos pendientes para Cocina o Bar
const getPedidosPendientes = async (req, res) => {
  try {
    const { tipo } = req.params;
    if (tipo !== 'Cocina' && tipo !== 'Bar') {
      return res.status(400).json({ message: "Tipo debe ser 'Cocina' o 'Bar'" });
    }
    const pedidos = await Pedido.getPedidosParaKDS(tipo);
    res.status(200).json(pedidos);
  } catch (error) {
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice." });
    }
    res.status(500).json({ message: "Error al obtener pedidos para KDS", error: error.message });
  }
};

// (RF08) Marcar un pedido como "En Preparación" o "Listo"
const cambiarEstadoPedidoKDS = async (req, res) => {
  try {
    const { idPedido } = req.params;
    const { estado } = req.body; // "en_preparacion" o "listo"

    if (estado !== 'en_preparacion' && estado !== 'listo') {
      return res.status(400).json({ message: "Estado debe ser 'en_preparacion' o 'listo'" });
    }
    
    // Usamos la función modificada que devuelve el piso
    const { piso } = await Pedido.updateEstado(idPedido, estado);
    
    // --- ¡AQUÍ LA MAGIA DE SOCKET.IO! ---
    // (RF09) Si el pedido está listo, notificamos al mozo de ESE PISO
    if (estado === 'listo') {
      const io = req.app.get('io');
      const salaMozo = `piso-${piso}`; // ej: "piso-1"
      
      // Emitimos un evento a la "sala" del piso
      io.to(salaMozo).emit('pedido-listo', { idPedido, estado });
      console.log(`Socket.io: Notificando a la sala '${salaMozo}'`);
    }
    // --- Fin de la magia ---

    res.status(200).json({ message: `Pedido ${idPedido} actualizado a ${estado}` });
    
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado de pedido", error: error.message });
  }
};

module.exports = {
  getPedidosPendientes,
  cambiarEstadoPedidoKDS
};