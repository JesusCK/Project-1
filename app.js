const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'locationdb.col4pixfadqv.us-east-2.rds.amazonaws.com',
  user: 'root',
  password: '123456789',
  database: 'LocationDB',
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conexión a la base de datos establecida');
});

// Configura la página web
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Configura Socket.io para enviar actualizaciones cada 5 segundos
setInterval(() => {
  // Consulta el último registro en la base de datos
  db.query('SELECT * FROM gps ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return;
    }

    if (results.length > 0) {
      const { Latitud, Longitud, Estampa_de_tiempo } = results[0];

      // Envia la información a los clientes conectados
      io.emit('update', { Latitud, Longitud, Estampa_de_tiempo });
    }
  });
}, 5000); // Cada 5 segundos

// Configura Socket.io para manejar conexiones de clientes
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Inicia el servidor
const port = process.env.PORT || 80;
server.listen(port, () => {
  console.log(`Servidor web en funcionamiento en el puerto ${port}`);
});
