const Pedido = require('../models/Pedido.js');
const Producto = require('../models/Producto.js');
const Pago = require('../models/Pago.js');
const Mesa = require('../models/Mesa.js'); 
const { db } = require('../Connection/Firestore.js');

const registrarPago = async (req, res) => {
  const batch = db.batch();
  let pedidoPagado = null; 

  try {
    const { ticketId, metodoDePago } = req.body;
    const { id: cajaId, piso: pisoCaja } = req.usuario; 

    if (!ticketId || !metodoDePago) {
      return res.status(400).json({ message: "Faltan ticketId o metodoDePago" });
    }

    const pedidoPendiente = await Pedido.registrarPagoPorTicket(batch, ticketId);
    pedidoPagado = { ...pedidoPendiente, estado: 'pagado' }; 

    for (const item of pedidoPendiente.items) {
      const productoDoc = await Producto.getById(item.productoId);
      if (productoDoc.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${productoDoc.nombre} al momento de pagar.`);
      }
      Producto.descontarStock(batch, item.productoId, item.cantidad);
    }

    const datosDelPago = {
      pedidoId: pedidoPendiente.id,
      ticketId: pedidoPendiente.ticketId,
      monto: pedidoPendiente.total,
      metodoDePago: metodoDePago,
      cajaId: cajaId,
      piso: pisoCaja,
      fecha: new Date()
    };
    Pago.create(batch, datosDelPago);

    await batch.commit();

    const io = req.app.get('io');
    const destinos = pedidoPagado.destinos || []; 
    destinos.forEach(destino => {
      io.to(destino).emit('nuevo-pedido', pedidoPagado);
      console.log(`Socket.io: Notificando a la sala '${destino}'`);
    });

    res.status(200).json({ message: "¡Pago registrado, stock descontado y transacción guardada!", pedido: pedidoPagado });

  } catch (error) {
    if (error.message.includes("Stock insuficiente")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Ticket no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice." });
    }
    res.status(500).json({ message: "Error en el servidor al registrar pago", error: error.message });
  }
};

const cancelarTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return res.status(400).json({ message: "Falta el ticketId" });
    }

    const mesaId = await Pedido.cancelarPedidoPorTicket(ticketId);

    const seLibero = await Mesa.verificarYLiberarMesa(mesaId);
    
    let message = `Ticket ${ticketId} cancelado.`;
    if (seLibero) {
      message += ` La mesa ${mesaId} ha sido liberada.`;
    }

    res.status(200).json({ message });

  } catch (error) {
    if (error.message.includes("No se puede cancelar")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("Ticket no encontrado")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice." });
    }
    res.status(500).json({ message: "Error al cancelar ticket", error: error.message });
  }
};


module.exports = {
  registrarPago,
  cancelarTicket 
};