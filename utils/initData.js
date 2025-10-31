    // Este script es solo para inicializar las mesas en la BD.
    // Se ejecuta una sola vez.

    // Usamos ../ para "subir" de 'utils' a la carpeta raíz
    // y luego entrar a 'Connection/Firestore.js'
const { db } = require('../Connection/Firestore.js');
    async function crearMesas() {
    console.log('Iniciando la creación de las 60 mesas...');
    
    const batch = db.batch(); 
    const pisos = 3;
    const mesasPorPiso = 20;

    for (let p = 1; p <= pisos; p++) {
        for (let m = 1; m <= mesasPorPiso; m++) {
        
        // Creamos un ID personalizado: P1-M01, P1-M02, etc.
        const idMesa = `P${p}-M${String(m).padStart(2, '0')}`;
        
        const mesaRef = db.collection('mesas').doc(idMesa);
        
        const nuevaMesa = {
            piso: p,
            numero: m,
            estado: 'libre', // Estado inicial
        };
        
        batch.set(mesaRef, nuevaMesa);
        }
    }

    try {
        await batch.commit();
        console.log('✅ ¡Éxito! Se crearon 60 mesas en la colección "mesas".');
    } catch (error) {
        console.error('❌ Error al crear las mesas:', error);
    }
    }

    // Ejecutamos la función
    crearMesas();