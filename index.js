const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors'); 
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};

app.use(cors(corsOptions));

const io = new Server(server, { 
  cors: corsOptions 
});

const PORT = process.env.PORT || 3000;

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket.io: Usuario conectado con id ${socket.id}`);

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket.io: Usuario ${socket.id} se unió a la sala ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket.io: Usuario desconectado ${socket.id}`);
  });
});


app.use(express.json());
app.use('/api/mesas', require('./routes/mesas.routes.js')); 
app.use('/api/productos', require('./routes/productos.routes.js'));
app.use('/api/pedidos', require('./routes/pedidos.routes.js'));
app.use('/api/caja', require('./routes/caja.routes.js')); 
app.use('/api/kds', require('./routes/kds.routes.js'));
app.use('/api/usuarios', require('./routes/usuarios.routes.js'));
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/reportes', require('./routes/reportes.routes.js'));
app.get('/', (req, res) => {
  res.send('¡API del Restaurante Funcionando! 🚀');
});
server.listen(PORT, () => {
  console.log(`Servidor y Socket.io escuchando en http://localhost:${PORT}`);
});