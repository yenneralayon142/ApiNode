const authController = require('../controllers/authController');
const { validateBody } = require('../middlewares/validation');
const {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} = require('../validators/authValidators');

module.exports = (app) => {
  app.post('/api/auth/register', validateBody(registerSchema), authController.register);
  app.post('/api/auth/login', validateBody(loginSchema), authController.login);
  app.post('/api/auth/refresh', validateBody(refreshSchema), authController.refresh);
  app.post('/api/auth/logout', validateBody(logoutSchema), authController.logout);
  app.post(
    '/api/auth/password/request-reset',
    validateBody(requestPasswordResetSchema),
    authController.requestPasswordReset
  );
  app.post('/api/auth/password/reset', validateBody(resetPasswordSchema), authController.resetPassword);
};
