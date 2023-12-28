const express = require('express');
const server = require('http').createServer();
const WebSocketServer = require('ws').Server;
const PORT = 3000;

const app = express();

app.get('/', function (req, res) {
  res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);
server.listen(PORT, function () {
  console.log('Server started on port ' + PORT);
});

const wss = new WebSocketServer({server});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function (client) {
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  const clientsCount = wss.clients.size;
  console.log(`Clients connected, count: ${clientsCount}`);
  wss.broadcast(`Current clients count: ${clientsCount}`);

  if (ws.readyState === ws.OPEN) ws.send('Welcome to my server');

  ws.on('close', function close() {
    console.log('Disconnected');
  });
});
