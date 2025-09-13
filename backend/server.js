const express = require('express');
const passport = require('passport');
const app = express();
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan');
const cors = require('cors');
const usersRoutes = require('./routes/userRoute');
const port = process.env.PORT || 3000;
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
app.disable('x-powered-by');
app.set('port', port);
usersRoutes(app);
server.listen(3000, '172.29.224.1' || 'localhost', function(){
  console.log('App node.js ' + process.pid + ' ejecutando en ' + server.address().address + ':' + server.address().port);
});
app.get('/', (req, res) => {
  res.send('Ruta raíz del Backend');
});
app.get('/test', (req, res) => {
  res.send('Ruta TEST');
});
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.stack);
});