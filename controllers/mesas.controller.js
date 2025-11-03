const Mesa = require('../models/Mesa.js');

const obtenerTodasLasMesas = async (req, res) => {
  try {
    const mesas = await Mesa.getAll();
    
    res.status(200).json(mesas);
    
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor al obtener mesas", error: error.message });
  }
};

const cambiarEstadoMesa = async (req, res) => {
  try {
    const { idMesa } = req.params;
    const { estado } = req.body;

    if (!estado || (estado !== 'libre' && estado !== 'ocupada')) {
      return res.status(400).json({ message: "El estado debe ser 'libre' u 'ocupada'" });
    }

    const mesaActualizada = await Mesa.updateEstado(idMesa, estado);
    
    res.status(200).json({ message: "Estado de mesa actualizado", mesa: mesaActualizada });
    
  } catch (error) {
    if (error.message === "La mesa no existe") {
      return res.status(404).json({ message: "Mesa no encontrada" });
    }
    res.status(500).json({ message: "Error en el servidor al actualizar mesa", error: error.message });
  }
};

module.exports = {
  obtenerTodasLasMesas,
  cambiarEstadoMesa
};