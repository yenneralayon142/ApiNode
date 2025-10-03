process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_DAYS = process.env.JWT_REFRESH_DAYS || '7';
process.env.PASSWORD_RESET_TOKEN_MINUTES = process.env.PASSWORD_RESET_TOKEN_MINUTES || '60';

jest.spyOn(console, 'error').mockImplementation(() => {});
