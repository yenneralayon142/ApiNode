const { ZodError } = require('zod');
const { ValidationError } = require('../utils/errors');

const buildDetails = (error) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));

const applySchema = (schema, property) => (req, res, next) => {
  if (!schema) {
    return next();
  }

  try {
    const result = schema.parse(req[property]);
    req[property] = result;
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return next(new ValidationError('Error de validación en la solicitud.', buildDetails(err)));
    }
    return next(err);
  }
};

const validateBody = (schema) => applySchema(schema, 'body');
const validateQuery = (schema) => applySchema(schema, 'query');
const validateParams = (schema) => applySchema(schema, 'params');

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
