const passport = require('passport');
const categoryController = require('../controllers/categoryController');
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation');
const {
  createCategorySchema,
  updateCategorySchema,
  listCategoryQuerySchema,
  categoryIdParamSchema
} = require('../validators/categoryValidators');

const auth = passport.authenticate('jwt', { session: false });

module.exports = (app) => {
  app.get('/api/categories', auth, validateQuery(listCategoryQuerySchema), categoryController.list);
  app.get('/api/categories/:id', auth, validateParams(categoryIdParamSchema), categoryController.show);
  app.post('/api/categories', auth, validateBody(createCategorySchema), categoryController.create);
  app.put(
    '/api/categories/:id',
    auth,
    validateParams(categoryIdParamSchema),
    validateBody(updateCategorySchema),
    categoryController.update
  );
  app.delete(
    '/api/categories/:id',
    auth,
    validateParams(categoryIdParamSchema),
    categoryController.remove
  );
};
