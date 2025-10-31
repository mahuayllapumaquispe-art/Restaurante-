// Importamos el modelo que acabamos de crear
const Mesa = require('../models/Mesa.js');

// Controlador para obtener todas las mesas (RF01)
const obtenerTodasLasMesas = async (req, res) => {
  try {
    // 1. Llama al modelo para obtener los datos
    const mesas = await Mesa.getAll();
    
    // 2. Responde al cliente (la app) con los datos en formato JSON
    res.status(200).json(mesas);
    
  } catch (error) {
    // 3. Si algo sale mal, envía un error
    res.status(500).json({ message: "Error en el servidor al obtener mesas", error: error.message });
  }
};

// Controlador para cambiar el estado de una mesa (RF01, RF10)
const cambiarEstadoMesa = async (req, res) => {
  try {
    // 1. Obtenemos el ID de la mesa (ej: P1-M01) de la URL
    const { idMesa } = req.params;
    
    // 2. Obtenemos el nuevo estado (ej: "ocupada") del cuerpo (body) del JSON
    const { estado } = req.body;

    // Validación simple
    if (!estado || (estado !== 'libre' && estado !== 'ocupada')) {
      return res.status(400).json({ message: "El estado debe ser 'libre' u 'ocupada'" });
    }

    // 3. Llamamos al modelo para actualizar
    const mesaActualizada = await Mesa.updateEstado(idMesa, estado);
    
    // 4. Respondemos con éxito
    res.status(200).json({ message: "Estado de mesa actualizado", mesa: mesaActualizada });
    
  } catch (error) {
    // 5. Manejo de errores (ej: si la mesa no existe o falla el servidor)
    if (error.message === "La mesa no existe") {
      return res.status(404).json({ message: "Mesa no encontrada" });
    }
    res.status(500).json({ message: "Error en el servidor al actualizar mesa", error: error.message });
  }
};

// Exportamos los controladores
module.exports = {
  obtenerTodasLasMesas,
  cambiarEstadoMesa
};