const Transaction = require('../models/transaction');

const handleUnexpectedError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
};

const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await Transaction.getSummaryForUser(userId, req.query || {});
    return res.status(200).json({
      success: true,
      message: 'Resumen calculado correctamente.',
      data: summary
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al obtener el resumen de transacciones.');
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await Transaction.getMonthlySummaryForUser(userId, req.query || {});
    return res.status(200).json({
      success: true,
      message: 'Resumen mensual generado correctamente.',
      data: summary
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al obtener el resumen mensual.');
  }
};

const getCategorySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Transaction.getCategorySummaryForUser(userId, req.query || {});
    return res.status(200).json({
      success: true,
      message: 'Resumen por categoría generado correctamente.',
      data: result
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al obtener el resumen por categoría.');
  }
};

module.exports = {
  getSummary,
  getMonthlySummary,
  getCategorySummary
};
