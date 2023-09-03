const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configura la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'LocationDB'
});

// Ruta para servir la página HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Escucha la conexión de socket.io
io.on('connection', socket => {
  console.log('Cliente conectado');

  // Función para enviar los datos actualizados a los clientes
  function sendUpdatedData() {
    connection.query('Select * from gps where id=(select max(id) from gps)', (err, results) => {
      if (err) throw err;
      socket.emit('dataUpdate', results);
    });
  }

  // Enviar datos iniciales al cliente al conectar
  sendUpdatedData();

  // Ejecutar la función cada 10 segundos (10000 ms)
  const interval = setInterval(sendUpdatedData, 5000);

  function sendUpdatedData2() {
    connection.query('Select * from gps ', (err, results2) => {
      if (err) throw err;
      socket.emit('dataUpdate2', results2);
    });
  }

  // Enviar datos iniciales al cliente al conectar
  sendUpdatedData2();

  // Ejecutar la función cada 10 segundos (10000 ms)
  const interval2 = setInterval(sendUpdatedData2, 5000);

  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
    clearInterval(interval); // Detener la actualización al desconectar
  });
});



server.listen(3000, () => {
  console.log('Servidor en funcionamiento en el puerto 3000');
});
