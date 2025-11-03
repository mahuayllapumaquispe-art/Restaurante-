const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json"); 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

console.log("Conectando a la base de datos de Firestore...");

module.exports = { db, admin };