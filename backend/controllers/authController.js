const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const PasswordResetToken = require('../models/passwordResetToken');
const keys = require('../config/keys');

const ACCESS_TOKEN_ISSUER = 'control-gastos-api';

const isEmail = (value = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim().toLowerCase());

const isStrongPassword = (value = '') =>
  typeof value === 'string' && value.length >= 8;

const buildAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    keys.secretOrKey,
    {
      expiresIn: keys.jwtExpiresIn,
      issuer: ACCESS_TOKEN_ISSUER
    }
  );

const buildRefreshToken = () => crypto.randomBytes(40).toString('hex');

const refreshExpiresAt = () => {
  const days = Number(keys.refreshTokenTtlDays) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const passwordResetExpiresAt = () => {
  const minutes = Number(keys.passwordResetTokenTtlMinutes) || 60;
  return new Date(Date.now() + minutes * 60 * 1000);
};

const issueTokensForUser = async (user) => {
  await RefreshToken.revokeAllForUser(user.id);

  const refreshToken = buildRefreshToken();
  const refreshExpiry = refreshExpiresAt();
  await RefreshToken.save({
    userId: user.id,
    token: refreshToken,
    expiresAt: refreshExpiry
  });

  const accessToken = buildAccessToken(user);
  return {
    accessToken,
    refreshToken,
    expiresIn: keys.jwtExpiresIn,
    refreshTokenExpiresAt: refreshExpiry.toISOString()
  };
};

const handleUnexpectedError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  return res.status(500).json({
    success: false,
    message: fallbackMessage
  });
};

const register = async (req, res) => {
  try {
    const { email, password, name, lastname, phone, image } = req.body || {};

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico no es válido.'
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres.'
      });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'El correo ya está registrado.'
      });
    }

    const createdUser = await User.create({
      email,
      password,
      name,
      lastname,
      phone,
      image
    });

    const tokens = await issueTokensForUser(createdUser);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente.',
      data: {
        user: createdUser,
        tokens
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al registrar el usuario.');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isEmail(email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas.'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrectos.'
      });
    }

    const passwordMatch = await User.comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Correo o contraseña incorrectos.'
      });
    }

    const tokens = await issueTokensForUser(user);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        user: User.toPublic(user),
        tokens
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al iniciar sesión.');
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un refresh token.'
      });
    }

    const record = await RefreshToken.findActiveByToken(refreshToken);
    if (!record) {
      return res.status(401).json({
        success: false,
        message: 'El refresh token es inválido o ha expirado.'
      });
    }

    await RefreshToken.revokeById(record.id, 'rotated');

    const user = await User.findById(record.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    const tokens = await issueTokensForUser(user);

    return res.status(200).json({
      success: true,
      message: 'Token renovado correctamente.',
      data: {
        user: User.toPublic(user),
        tokens
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al refrescar el token.');
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un refresh token.'
      });
    }

    await RefreshToken.revokeByToken(refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente.'
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al cerrar sesión.');
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!isEmail(email)) {
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace de recuperación.'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Si el correo existe, se enviará un enlace de recuperación.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = passwordResetExpiresAt();
    await PasswordResetToken.create({
      userId: user.id,
      token,
      expiresAt
    });

    const response = {
      success: true,
      message: 'Se generó un token de recuperación. Revisa tu correo.'
    };

    if (process.env.NODE_ENV !== 'production') {
      response.data = {
        resetToken: token,
        expiresAt: expiresAt.toISOString()
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al solicitar el restablecimiento de contraseña.');
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};

    if (!token || !isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o contraseña débil.'
      });
    }

    const record = await PasswordResetToken.findActiveByToken(token);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'El token es inválido o ha expirado.'
      });
    }

    await User.updatePassword(record.user_id, newPassword);
    await PasswordResetToken.markUsed(record.id);
    await RefreshToken.revokeAllForUser(record.user_id);

    const user = await User.findById(record.user_id);

    return res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente.',
      data: {
        user: User.toPublic(user)
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al restablecer la contraseña.');
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  requestPasswordReset,
  resetPassword
};
