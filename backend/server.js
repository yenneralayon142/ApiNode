const express = require('express');
const passport = require('passport');
const http = require('http');
const logger = require('morgan');
const cors = require('cors');

const usersRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoute');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable('x-powered-by');

app.use(passport.initialize());
require('./config/passport')(passport);

authRoutes(app);
usersRoutes(app);

app.get('/', (req, res) => {
  res.send('API de Control de Gastos en ejecución.');
});

app.get('/test', (req, res) => {
  res.send('Ruta TEST');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send(err.stack);
});

server.listen(port, host, () => {
  const address = server.address();
  console.log(`App node.js ${process.pid} ejecutándose en ${address.address}:${address.port}`);
});
