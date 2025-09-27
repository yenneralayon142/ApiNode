const authController = require('../controllers/authController');

module.exports = (app) => {
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/refresh', authController.refresh);
  app.post('/api/auth/logout', authController.logout);
  app.post('/api/auth/password/request-reset', authController.requestPasswordReset);
  app.post('/api/auth/password/reset', authController.resetPassword);
};
