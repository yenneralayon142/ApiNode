const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');

const handleUnexpectedError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Perfil recuperado.',
      data: User.toPublic(user)
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al obtener el perfil.');
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    if (updates.email && updates.email !== currentUser.email) {
      const existingByEmail = await User.findByEmail(updates.email);
      if (existingByEmail && existingByEmail.id !== userId) {
        return res.status(409).json({
          success: false,
          message: 'El correo ya esta registrado por otro usuario.'
        });
      }
    }

    const updated = await User.update({ id: userId, ...updates });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado.',
      data: updated
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al actualizar el perfil.');
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    const matches = await User.comparePassword(currentPassword, user.password);
    if (!matches) {
      return res.status(400).json({
        success: false,
        message: 'La contrasena actual no es correcta.'
      });
    }

    await User.updatePassword(userId, newPassword);
    await RefreshToken.revokeAllForUser(userId);

    return res.status(200).json({
      success: true,
      message: 'Contrasena actualizada. Por favor inicia sesion nuevamente.'
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al actualizar la contrasena.');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
