const User = require('../models/user');
const authController = require('./authController');

const handleUnexpectedError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json({
      success: true,
      message: 'Lista de usuarios',
      data: users
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al listar usuarios');
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario encontrado',
      data: User.toPublic(user)
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al consultar el usuario');
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, ...changes } = req.body || {};
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el identificador del usuario.'
      });
    }

    const updated = await User.update({ id, ...changes });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado',
      data: updated
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al actualizar el usuario');
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el identificador del usuario.'
      });
    }

    const result = await User.remove(id);
    if (!result.deleted) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario eliminado',
      data: { id }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al eliminar el usuario');
  }
};

module.exports = {
  login: authController.login,
  register: authController.register,
  getAllUsers,
  getUserById,
  getUserUpdate: updateUser,
  getUserDelete: deleteUser
};
