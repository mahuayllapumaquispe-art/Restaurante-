// ¡Importamos 'db' de nuestra conexión!
const { db } = require('../Connection/Firestore.js');
const coleccionPedidos = db.collection('pedidos');

/* ... (Estructura del Pedido y funciones create, getAll) ... */
const create = async (data) => {
  try {
    const tiempoExpiracion = 30 * 60 * 1000; 
    data.ticketId = `T-${Date.now()}`;
    data.fechaCreacion = new Date();
    data.estado = 'pendiente'; 
    data.fechaExpiracion = new Date(Date.now() + tiempoExpiracion); 
    data.total = data.items.reduce((acc, item) => {
      return acc + (item.precioUnitario * item.cantidad);
    }, 0);
    const docRef = await coleccionPedidos.add(data);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw new Error("Error al crear pedido");
  }
};

const getAll = async () => {
  try {
    const snapshot = await coleccionPedidos.orderBy('fechaCreacion', 'desc').get();
    const pedidos = [];
    snapshot.forEach(doc => {
      pedidos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return pedidos;
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    throw new Error("Error al obtener pedidos");
  }
};


// --- ¡FUNCIÓN MODIFICADA! ---
// (U)PDATE - Actualiza ESTADO y devuelve el 'piso' del pedido
const updateEstado = async (id, nuevoEstado) => {
  try {
    const docRef = coleccionPedidos.doc(id);
    
    // Obtenemos el documento para saber el 'piso'
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("Pedido no encontrado al actualizar estado");
    }
    const pisoDelPedido = doc.data().piso; // ¡Obtenemos el piso!

    // Actualizamos el estado
    await docRef.update({
      estado: nuevoEstado
    });
    
    // Devolvemos el piso para la notificación
    return { id, nuevoEstado, piso: pisoDelPedido }; 
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    throw new Error("Error al actualizar estado");
  }
};

// FUNCIÓN DE LIMPIEZA - Cancelar expirados
const cancelarExpirados = async () => {
  try {
    const ahora = new Date();
    const snapshot = await coleccionPedidos
      .where('estado', '==', 'pendiente')
      .where('fechaExpiracion', '<=', ahora)
      .get();
    if (snapshot.empty) return 0;
    const batch = db.batch();
    const mesasLiberadas = new Set(); 
    snapshot.forEach(doc => {
      const pedido = doc.data();
      batch.update(doc.ref, { estado: 'cancelado' });
      mesasLiberadas.add(pedido.mesaId);
    });
    for (const mesaId of mesasLiberadas) {
      const mesaRef = db.collection('mesas').doc(mesaId);
      batch.update(mesaRef, { estado: 'libre' });
    }
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error("Error al cancelar pedidos expirados:", error);
    throw error;
  }
};

// FUNCIÓN KDS - Busca pedidos 'pagados' para un destino
const getPedidosParaKDS = async (tipoKDS) => {
  try {
    const snapshot = await coleccionPedidos
      .where('estado', '==', 'pagado')
      .where('destinos', 'array-contains', tipoKDS)
      .orderBy('fechaPago', 'asc')
      .get();
    const pedidos = [];
    snapshot.forEach(doc => { pedidos.push({ id: doc.id, ...doc.data() }); });
    return pedidos;
  } catch (error) {
    console.error(`Error al obtener pedidos para KDS (${tipoKDS}):`, error);
    throw error;
  }
};

// FUNCIÓN DE CAJA - Añade pago a un lote
const registrarPagoPorTicket = async (batch, ticketId) => {
  try {
    const snapshot = await coleccionPedidos
      .where('ticketId', '==', ticketId)
      .where('estado', '==', 'pendiente')
      .limit(1)
      .get();
    if (snapshot.empty) throw new Error("Ticket no encontrado o ya no está pendiente");
    const doc = snapshot.docs[0];
    const pedidoRef = doc.ref;
    batch.update(pedidoRef, { estado: 'pagado', fechaPago: new Date() });
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error al registrar pago por ticket:", error);
    throw error;
  }
};

// FUNCIÓN MOZO - Busca pedidos 'listos' para un piso
const getPedidosListosPorPiso = async (piso) => {
  try {
    const snapshot = await coleccionPedidos
      .where('estado', '==', 'listo')
      .where('piso', '==', piso)
      .orderBy('fechaCreacion', 'asc')
      .get();
    const pedidos = [];
    snapshot.forEach(doc => { pedidos.push({ id: doc.id, ...doc.data() }); });
    return pedidos;
  } catch (error) {
    console.error(`Error al obtener pedidos listos para piso ${piso}:`, error);
    throw error;
  }
};

// FUNCIÓN MOZO - Cancela un pedido (si está pendiente)
const cancelarPedido = async (pedidoId) => {
  try {
    const docRef = coleccionPedidos.doc(pedidoId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Pedido no encontrado");
    const pedido = doc.data();
    if (pedido.estado !== 'pendiente') {
      throw new Error(`No se puede cancelar. El pedido ya está '${pedido.estado}'.`);
    }
    await docRef.update({ estado: 'cancelado' });
    return pedido.mesaId; 
  } catch (error) {
    console.error(`Error al cancelar pedido ${pedidoId}:`, error);
    throw error;
  }
};

// FUNCIÓN REPORTES - Obtiene items vendidos
const getItemsVendidosPorRango = async (fechaInicio, fechaFin) => {
  try {
    const estadosPagados = ['pagado', 'en_preparacion', 'listo', 'entregado'];
    const snapshot = await coleccionPedidos
      .where('fechaPago', '>=', fechaInicio)
      .where('fechaPago', '<=', fechaFin)
      .where('estado', 'in', estadosPagados)
      .get();
    const conteoProductos = {}; 
    snapshot.forEach(doc => {
      const pedido = doc.data();
      pedido.items.forEach(item => {
        const id = item.productoId;
        const nombre = item.nombre;
        const cantidad = item.cantidad;
        if (conteoProductos[id]) {
          conteoProductos[id].cantidad += cantidad;
        } else {
          conteoProductos[id] = { nombre: nombre, cantidad: cantidad };
        }
      });
    });
    const productosMasVendidos = Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad);
    return productosMasVendidos;
  } catch (error) {
    console.error("Error al obtener reporte de productos:", error);
    throw error;
  }
};


// Exportamos todas las funciones
module.exports = {
  create,
  getAll,
  updateEstado,
  cancelarExpirados,
  getPedidosParaKDS,
  registrarPagoPorTicket,
  getPedidosListosPorPiso,
  cancelarPedido,
  getItemsVendidosPorRango
};