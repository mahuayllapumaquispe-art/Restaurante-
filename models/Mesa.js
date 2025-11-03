const { db } = require('../Connection/Firestore.js');
const coleccionMesas = db.collection('mesas');
const coleccionPedidos = db.collection('pedidos'); 
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
const verificarYLiberarMesa = async (mesaId) => {
  try {
    const estadosActivos = ['pendiente', 'pagado', 'en_preparacion', 'listo'];
    
    const snapshot = await coleccionPedidos
      .where('mesaId', '==', mesaId)
      .where('estado', 'in', estadosActivos)
      .limit(1)
      .get();

    if (snapshot.empty) {

      await updateEstado(mesaId, 'libre');
      return true; 
    }

    return false; 
  } catch (error) {
    console.error(`Error al verificar y liberar mesa ${mesaId}:`, error);
    throw error;
  }
};


module.exports = {
  getAll,
  updateEstado,
  verificarYLiberarMesa 
};