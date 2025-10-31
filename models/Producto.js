// ¡Importamos 'db' y 'admin' de nuestra conexión!
const { db, admin } = require('../Connection/Firestore.js');
const coleccionProductos = db.collection('productos');

/* ... (Estructura del Producto) ... */

// (C)REATE - Crear un nuevo producto (RF13)
const create = async (data) => {
  try {
    const docRef = await coleccionProductos.add(data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw new Error("Error al crear producto");
  }
};

// (R)EAD - Obtener todos los productos
const getAll = async () => {
  try {
    const snapshot = await coleccionProductos.orderBy('categoria').orderBy('nombre').get();
    const productos = [];
    snapshot.forEach(doc => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return productos;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("Error al obtener productos");
  }
};

// (R)EAD - Obtener un producto por su ID
const getById = async (id) => {
  try {
    const docRef = coleccionProductos.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Producto no encontrado");
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    throw error;
  }
};

// (U)PDATE - Actualizar un producto
const update = async (id, data) => {
  try {
    const docRef = coleccionProductos.doc(id);
    await docRef.update(data);
    return id;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw new Error("Error al actualizar producto");
  }
};

// (D)ELETE - Eliminar un producto
const remove = async (id) => {
  try {
    const docRef = coleccionProductos.doc(id);
    await docRef.delete();
    return id;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw new Error("Error al eliminar producto");
  }
};

// (RF11) Añade descuento de stock a un lote (batch)
const descontarStock = (batch, productoId, cantidadADescontar) => {
  try {
    const docRef = coleccionProductos.doc(productoId);
    const decremento = admin.firestore.FieldValue.increment(cantidadADescontar * -1);
    batch.update(docRef, { stock: decremento });
  } catch (error) {
    console.error(`Error al añadir descuento de stock al batch for ${productoId}:`, error);
    throw error; 
  }
};

// --- ¡NUEVA FUNCIÓN! (RF11 - Alerta) ---
// Obtiene productos con stock por debajo de un umbral
const getStockBajo = async (umbral) => {
  try {
    const snapshot = await coleccionProductos
      .where('stock', '<=', umbral)
      .orderBy('stock', 'asc') // Opcional: mostrar los más críticos primero
      .get();
      
    const productos = [];
    snapshot.forEach(doc => {
      productos.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return productos;

  } catch (error) {
    console.error("Error al obtener stock bajo:", error);
    // (Recuerda crear el índice para 'stock' en la col. 'productos')
    throw error;
  }
};


module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  descontarStock,
  getStockBajo // <-- AÑADIDA
};