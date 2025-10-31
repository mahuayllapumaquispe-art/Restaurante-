const { db } = require('../Connection/Firestore.js');
const coleccionUsuarios = db.collection('usuarios');

/*
  Estructura de un documento 'Usuario' en Firestore:
  {
    "nombre": "Juan Perez",
    "username": "jperez", // Para login
    "passwordHash": "hash_super_secreto_de_bcrypt",
    "rol": "Mozo", // Roles: "Admin", "Mozo", "Caja", "Cocinero"
    "pisoAsignado": 1, // 1, 2, o 3. Null para Admin/Cocinero
    "activo": true
  }
*/

// (C)REATE - Crear un nuevo usuario (Lo usa el Admin)
const create = async (data) => {
  try {
    // El 'passwordHash' ya debe venir encriptado desde el controlador
    data.activo = true;
    const docRef = await coleccionUsuarios.add(data);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw new Error("Error al crear usuario");
  }
};

// (R)EAD - Buscar un usuario por su 'username' (Para el Login)
const findByUsername = async (username) => {
  try {
    const snapshot = await coleccionUsuarios
      .where('username', '==', username)
      .where('activo', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null; // No se encontró el usuario
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() }; // Devuelve el usuario completo

  } catch (error) {
    console.error("Error al buscar usuario:", error);
    throw new Error("Error al buscar usuario");
  }
};

// (R)EAD - Obtener todos los usuarios (Lo usa el Admin)
const getAll = async () => {
  try {
    const snapshot = await coleccionUsuarios.orderBy('nombre').get();
    const usuarios = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // ¡Nunca devolvemos el hash de la contraseña!
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
  // (Aquí irían 'update' y 'delete' después)
};