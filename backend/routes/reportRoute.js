const passport = require('passport');
const reportController = require('../controllers/reportController');
const { validateQuery } = require('../middlewares/validation');
const {
  summaryQuerySchema,
  monthlySummaryQuerySchema,
  categorySummaryQuerySchema
} = require('../validators/reportValidators');

const auth = passport.authenticate('jwt', { session: false });

module.exports = (app) => {
  app.get('/api/reports/summary', auth, validateQuery(summaryQuerySchema), reportController.getSummary);
  app.get('/api/reports/monthly', auth, validateQuery(monthlySummaryQuerySchema), reportController.getMonthlySummary);
  app.get('/api/reports/categories', auth, validateQuery(categorySummaryQuerySchema), reportController.getCategorySummary);
};
