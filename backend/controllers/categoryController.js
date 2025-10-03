const Category = require('../models/category');

const handleUnexpectedError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
};

const list = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query || {};
    const categories = await Category.findAllByUser(userId, { type });
    return res.status(200).json({
      success: true,
      message: 'Categorías recuperadas correctamente.',
      data: categories
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al listar las categorías.');
  }
};

const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, description = null, color = null, icon = null } = req.body || {};

    try {
      const category = await Category.create({
        userId,
        name,
        type: type || 'expense',
        description,
        color,
        icon
      });

      return res.status(201).json({
        success: true,
        message: 'Categoría creada correctamente.',
        data: category
      });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre.'
        });
      }
      throw err;
    }
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al crear la categoría.');
  }
};

const show = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const category = await Category.findByIdForUser(id, userId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Categoría encontrada.',
      data: category
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al consultar la categoría.');
  }
};

const update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = {
      id,
      userId,
      ...req.body
    };

    try {
      const category = await Category.updateForUser(updates);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Categoría actualizada correctamente.',
        data: category
      });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre.'
        });
      }
      throw err;
    }
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al actualizar la categoría.');
  }
};

const remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deleted = await Category.removeForUser(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Categoría eliminada correctamente.'
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al eliminar la categoría.');
  }
};

module.exports = {
  list,
  create,
  show,
  update,
  remove
};
