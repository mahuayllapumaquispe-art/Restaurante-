const { db } = require('../Connection/Firestore.js');
const coleccionPagos = db.collection('pagos');
const create = (batch, datosPago) => {
  try {
    const docRef = coleccionPagos.doc(); 
    batch.set(docRef, datosPago);
    
  } catch (error) {
    console.error("Error al añadir 'crear pago' al batch:", error);
    throw error;
  }
};
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
    throw error;
  }
};
module.exports = {
  create,
  getVentasPorRango 
};