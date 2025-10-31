const admin = require("firebase-admin");

// Importamos la llave
const serviceAccount = require("../serviceAccountKey.json"); 

// Inicializamos la app de Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtenemos la referencia a la base de datos
const db = admin.firestore();

console.log("Conectando a la base de datos de Firestore...");

// Exportamos 'db' (para consultas) y 'admin' (para FieldValue)
module.exports = { db, admin };