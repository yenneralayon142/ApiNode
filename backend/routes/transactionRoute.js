const passport = require('passport');
const transactionController = require('../controllers/transactionController');
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation');
const {
  listTransactionQuerySchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamSchema,
  syncTransactionsSchema
} = require('../validators/transactionValidators');

const auth = passport.authenticate('jwt', { session: false });

module.exports = (app) => {
  app.get('/api/transactions', auth, validateQuery(listTransactionQuerySchema), transactionController.list);
  app.get(
    '/api/transactions/:id',
    auth,
    validateParams(transactionIdParamSchema),
    transactionController.show
  );
  app.post('/api/transactions', auth, validateBody(createTransactionSchema), transactionController.create);
  app.put(
    '/api/transactions/:id',
    auth,
    validateParams(transactionIdParamSchema),
    validateBody(updateTransactionSchema),
    transactionController.update
  );
  app.delete(
    '/api/transactions/:id',
    auth,
    validateParams(transactionIdParamSchema),
    transactionController.remove
  );
  app.post(
    '/api/transactions/sync',
    auth,
    validateBody(syncTransactionsSchema),
    transactionController.sync
  );
};
