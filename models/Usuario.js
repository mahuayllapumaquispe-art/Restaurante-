const { db } = require('../Connection/Firestore.js');
const coleccionUsuarios = db.collection('usuarios');

const create = async (data) => {
  try {
    data.activo = true;
    const docRef = await coleccionUsuarios.add(data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw new Error("Error al crear usuario");
  }
};

const findByUsername = async (username) => {
  try {
    const snapshot = await coleccionUsuarios
      .where('username', '==', username)
      .where('activo', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null; 
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() }; 

  } catch (error) {
    console.error("Error al buscar usuario:", error);
    throw new Error("Error al buscar usuario");
  }
};

const getAll = async () => {
  try {
    const snapshot = await coleccionUsuarios.orderBy('nombre').get();
    const usuarios = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      delete data.passwordHash; 
      usuarios.push({
        id: doc.id,
        ...data
      });
    });
    return usuarios;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw new Error("Error al obtener usuarios");
  }
};


module.exports = {
  create,
  findByUsername,
  getAll
};