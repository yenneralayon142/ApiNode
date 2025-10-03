const { AppError } = require('../utils/errors');

module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Error interno del servidor.';
  const payload = {
    success: false,
    message,
    code
  };

  if (err.details) {
    payload.details = err.details;
  }

  if (!(err instanceof AppError) || status >= 500) {
    console.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
  }

  res.status(status).json(payload);
};
