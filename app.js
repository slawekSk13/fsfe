const express = require('express');
const server = require('http').createServer();
const WebSocketServer = require('ws').Server;
const sqlite = require('sqlite3');
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

process.on('SIGINT', () => {
  console.log('sigint');
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.closeAllConnections();
  server.close(shutdownDB);
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function (client) {
    client.send(data);
  });
};

wss.on('connection', function connection(ws) {
  const clientsCount = wss.clients.size;
  writeToDB({count: clientsCount});
  console.log(`Clients connected, count: ${clientsCount}`);
  wss.broadcast(`Current clients count: ${clientsCount}`);

  if (ws.readyState === ws.OPEN) ws.send('Welcome to my server');

  ws.on('close', function close() {
    console.log('Disconnected');
  });
});

const db = new sqlite.Database(':memory:');

db.serialize(() => {
  db.run(`
  CREATE TABLE visitors (
    count INTEGER,
    time TEXT
  )
  `);
});

function getCounts() {
  db.each(`SELECT * FROM visitors`, (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  console.log('Shutting down db');
  getCounts();

  db.close();
}

function writeToDB(data) {
  db.run(`INSERT INTO visitors (count, time)
  VALUES (${data.count}, datetime('now'))`);
}
