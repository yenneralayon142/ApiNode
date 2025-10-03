const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

const server = http.createServer(app);

server.listen(port, host, () => {
  const address = server.address();
  console.log(`App node.js ${process.pid} ejecutándose en ${address.address}:${address.port}`);
});

module.exports = server;
