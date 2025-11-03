const Pedido = require('../models/Pedido.js');
const Pago = require('../models/Pago.js');

const getInicioDia = (fecha = new Date()) => {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
};

const getFinDia = (fecha = new Date()) => {
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999); 
  return fin;
};

const getReporteDelDia = async (req, res) => {
  try {
    const fechaInicio = getInicioDia();
    const fechaFin = getFinDia();

    const [reporteVentas, productosMasVendidos] = await Promise.all([
      Pago.getVentasPorRango(fechaInicio, fechaFin),
      Pedido.getItemsVendidosPorRango(fechaInicio, fechaFin)
    ]);

    res.status(200).json({
      fechaReporte: new Date().toLocaleDateString('es-PE'),
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