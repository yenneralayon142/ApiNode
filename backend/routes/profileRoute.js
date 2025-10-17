const passport = require('passport');
const profileController = require('../controllers/profileController');
const { validateBody } = require('../middlewares/validation');
const { profileUpdateSchema, changePasswordSchema } = require('../validators/profileValidators');

module.exports = (app) => {
  const auth = passport.authenticate('jwt', { session: false });

  app.get('/api/profile', auth, profileController.getProfile);
  app.patch('/api/profile', auth, validateBody(profileUpdateSchema), profileController.updateProfile);
  app.put(
    '/api/profile/password',
    auth,
    validateBody(changePasswordSchema),
    profileController.changePassword
  );
};
