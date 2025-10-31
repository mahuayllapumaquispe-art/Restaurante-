// Importamos la conexión
const { db } = require('../Connection/Firestore.js');
const coleccionPagos = db.collection('pagos');

/* ... (Estructura del Pago) ... */

// (C)REATE - Añade una operación de crear pago a un lote (batch)
const create = (batch, datosPago) => {
  try {
    const docRef = coleccionPagos.doc(); 
    batch.set(docRef, datosPago);
    
  } catch (error) {
    console.error("Error al añadir 'crear pago' al batch:", error);
    throw error;
  }
};

// --- ¡NUEVA FUNCIÓN! (Reporte de Ventas) ---
const getVentasPorRango = async (fechaInicio, fechaFin) => {
  try {
    const snapshot = await coleccionPagos
      .where('fecha', '>=', fechaInicio)
      .where('fecha', '<=', fechaFin)
      .get();
      
    let totalVentas = 0;
    let conteoPagos = 0;
    const metodos = {};

    snapshot.forEach(doc => {
      const pago = doc.data();
      
      totalVentas += pago.monto;
      conteoPagos++;
      
      // Agrupamos por método de pago
      if (metodos[pago.metodoDePago]) {
        metodos[pago.metodoDePago] += pago.monto;
      } else {
        metodos[pago.metodoDePago] = pago.monto;
      }
    });

    return {
      totalVentas,
      conteoPagos,
      desgloseMetodos: metodos
    };

  } catch (error) {
    console.error("Error al obtener reporte de ventas:", error);
    // (Recuerda crear el índice para 'fecha' en la col. 'pagos')
    throw error;
  }
};


module.exports = {
  create,
  getVentasPorRango // <-- AÑADIDA
};