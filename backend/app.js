const express = require('express');
const passport = require('passport');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { AppError } = require('./utils/errors');
const errorHandler = require('./middlewares/errorHandler');

const usersRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoute');
const categoryRoutes = require('./routes/categoryRoute');
const transactionRoutes = require('./routes/transactionRoute');
const reportRoutes = require('./routes/reportRoute');

const app = express();

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000');

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(AppError.forbidden('Origen no autorizado.'));
  },
  credentials: true
};

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(logger('dev'));
app.use(helmet());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

app.use('/api', apiLimiter);

app.use(passport.initialize());
require('./config/passport')(passport);

authRoutes(app);
usersRoutes(app);
categoryRoutes(app);
transactionRoutes(app);
reportRoutes(app);

app.get('/', (req, res) => {
  res.send('API de Control de Gastos en ejecución.');
});

app.get('/test', (req, res) => {
  res.send('Ruta TEST');
});

app.use((req, res, next) => {
  next(AppError.notFound('Ruta no encontrada.'));
});

app.use(errorHandler);

module.exports = app;
