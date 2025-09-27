const DEFAULT_SECRET = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

module.exports = {
  secretOrKey: process.env.JWT_SECRET || DEFAULT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenTtlDays: parseNumber(process.env.JWT_REFRESH_DAYS, 7),
  passwordResetTokenTtlMinutes: parseNumber(process.env.PASSWORD_RESET_TOKEN_MINUTES, 60)
};
