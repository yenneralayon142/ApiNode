class AppError extends Error {
  constructor(status, message, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST', details = null) {
    return new AppError(400, message, code, details);
  }

  static unauthorized(message = 'No autorizado.') {
    return new AppError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Acceso denegado.') {
    return new AppError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Recurso no encontrado.') {
    return new AppError(404, message, 'NOT_FOUND');
  }

  static conflict(message = 'Conflicto detectado.', details = null) {
    return new AppError(409, message, 'CONFLICT', details);
  }

  static internal(message = 'Error interno del servidor.') {
    return new AppError(500, message, 'INTERNAL_ERROR');
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(422, message, 'VALIDATION_ERROR', details);
  }
}

module.exports = {
  AppError,
  ValidationError
};
