// ¡Importamos { db } con llaves!
const { db } = require('../Connection/Firestore.js');
const coleccionMesas = db.collection('mesas');
const coleccionPedidos = db.collection('pedidos'); // ¡Necesitamos acceso a pedidos!

// Función para obtener TODAS las mesas
const getAll = async () => {
  try {
    const snapshot = await coleccionMesas.orderBy('piso').orderBy('numero').get();
    
    const mesas = [];
    snapshot.forEach(doc => {
      mesas.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return mesas;
  } catch (error) {
    console.error("Error al obtener todas las mesas:", error);
    throw new Error("Error al obtener mesas"); 
  }
};

// Función para cambiar el estado de UNA mesa
const updateEstado = async (idMesa, nuevoEstado) => {
  try {
    const mesaRef = coleccionMesas.doc(idMesa);
    
    const doc = await mesaRef.get();
    if (!doc.exists) {
      throw new Error("La mesa no existe");
    }
    
    await mesaRef.update({
      estado: nuevoEstado
    });
    
    return { id: idMesa, estado: nuevoEstado };
  } catch (error) {
    console.error(`Error al actualizar estado de mesa ${idMesa}:`, error);
    throw error; 
  }
};

// --- ¡NUEVA FUNCIÓN! (Liberar Mesa) ---
// Verifica si una mesa tiene más pedidos activos antes de liberarla
const verificarYLiberarMesa = async (mesaId) => {
  try {
    // Buscamos si existe CUALQUIER otro pedido activo para esta mesa
    // Activo = pendiente, pagado, en_preparacion, listo
    const estadosActivos = ['pendiente', 'pagado', 'en_preparacion', 'listo'];
    
    const snapshot = await coleccionPedidos
      .where('mesaId', '==', mesaId)
      .where('estado', 'in', estadosActivos)
      .limit(1)
      .get();

    // Si NO encontramos pedidos activos...
    if (snapshot.empty) {
      // ...liberamos la mesa
      await updateEstado(mesaId, 'libre');
      return true; // Se liberó la mesa
    }

    return false; // No se liberó, aún hay pedidos

  } catch (error) {
    console.error(`Error al verificar y liberar mesa ${mesaId}:`, error);
    // (Recuerda crear el índice para 'mesaId' y 'estado' en la col. 'pedidos')
    throw error;
  }
};


module.exports = {
  getAll,
  updateEstado,
  verificarYLiberarMesa // <-- AÑADIDA
};