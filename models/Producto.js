const { db, admin } = require('../Connection/Firestore.js');
const coleccionProductos = db.collection('productos');

const create = async (data) => {
  try {
    const docRef = await coleccionProductos.add(data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw new Error("Error al crear producto");
  }
};

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

const getStockBajo = async (umbral) => {
  try {
    const snapshot = await coleccionProductos
      .where('stock', '<=', umbral)
      .orderBy('stock', 'asc') 
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
  getStockBajo 
};