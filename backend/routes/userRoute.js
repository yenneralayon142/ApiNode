const userController = require('../controllers/userController');

module.exports = (app) => {
  app.get('/api/users', userController.getAllUsers);
  app.get('/api/users/:id', userController.getUserById);
  app.post('/api/users/create', userController.register); // Compatibilidad legacy
  app.post('/api/users/login', userController.login); // Compatibilidad legacy
  app.put('/api/users/update', userController.getUserUpdate);
  app.delete('/api/users/delete/:id', userController.getUserDelete);
};
