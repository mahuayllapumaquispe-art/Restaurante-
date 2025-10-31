const Pedido = require('../models/Pedido.js');
const Pago = require('../models/Pago.js');

// --- Funciones Helper para Fechas (en zona horaria local del servidor) ---
const getInicioDia = (fecha = new Date()) => {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0); // 00:00:00.000
  return inicio;
};

const getFinDia = (fecha = new Date()) => {
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999); // 23:59:59.999
  return fin;
};
// --- Fin de Helpers ---


// (RF12) Controlador para el Reporte Diario
const getReporteDelDia = async (req, res) => {
  try {
    // 1. Definimos el rango de "hoy"
    const fechaInicio = getInicioDia();
    const fechaFin = getFinDia();

    // 2. Obtenemos las ventas (con 'await Promise.all' para correr en paralelo)
    const [reporteVentas, productosMasVendidos] = await Promise.all([
      Pago.getVentasPorRango(fechaInicio, fechaFin),
      Pedido.getItemsVendidosPorRango(fechaInicio, fechaFin)
    ]);

    // 3. Enviamos el reporte consolidado
    res.status(200).json({
      fechaReporte: new Date().toLocaleDateString('es-PE'), // "30/10/2025"
      rango: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      ventas: reporteVentas,
      productos: productosMasVendidos
    });

  } catch (error) {
    if (error.message.includes("index")) {
      return res.status(500).json({ message: "Error de base de datos. Se requiere un índice." });
    }
    res.status(500).json({ message: "Error al generar el reporte diario", error: error.message });
  }
};

module.exports = {
  getReporteDelDia
};