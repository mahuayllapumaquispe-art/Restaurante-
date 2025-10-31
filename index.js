const express = require('express');
const http = require('http'); // 1. Importamos http
const { Server } = require("socket.io"); // 2. Importamos Server de socket.io

const app = express();
const server = http.createServer(app); // 3. Creamos el servidor http CON express
const io = new Server(server, { // 4. Inicializamos socket.io
  cors: {
    origin: "*", // Permite cualquier origen (frontend) - (cambiar en producción)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// 5. Guardamos 'io' en la app para que los controllers lo usen
app.set('io', io);

// --- Lógica de Conexión de Socket.io ---
io.on('connection', (socket) => {
  console.log(`Socket.io: Usuario conectado con id ${socket.id}`);

  // Creamos un "listener" para que los clientes (frontend) se unan a salas
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket.io: Usuario ${socket.id} se unió a la sala ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket.io: Usuario desconectado ${socket.id}`);
  });
});
// --- Fin de la lógica de Socket.io ---


// Middlewares
app.use(express.json()); // Para que Express entienda JSON

// --- Carga de Rutas ---
app.use('/api/mesas', require('./routes/mesas.routes.js')); 
app.use('/api/productos', require('./routes/productos.routes.js'));
app.use('/api/pedidos', require('./routes/pedidos.routes.js'));
app.use('/api/caja', require('./routes/caja.routes.js')); 
app.use('/api/kds', require('./routes/kds.routes.js'));
app.use('/api/usuarios', require('./routes/usuarios.routes.js'));
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/reportes', require('./routes/reportes.routes.js'));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.send('¡API del Restaurante Funcionando! 🚀');
});

// 6. ¡IMPORTANTE! Usamos server.listen() en lugar de app.listen()
server.listen(PORT, () => {
  console.log(`Servidor y Socket.io escuchando en http://localhost:${PORT}`);
});