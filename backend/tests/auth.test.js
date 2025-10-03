const request = require('supertest');

jest.mock('../models/user', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  comparePassword: jest.fn(),
  toPublic: jest.fn((user) => user),
  findById: jest.fn(),
  updatePassword: jest.fn()
}));

jest.mock('../models/refreshToken', () => ({
  revokeAllForUser: jest.fn(),
  save: jest.fn(),
  findActiveByToken: jest.fn(),
  revokeById: jest.fn(),
  revokeByToken: jest.fn()
}));

jest.mock('../models/passwordResetToken', () => ({
  create: jest.fn(),
  findActiveByToken: jest.fn(),
  markUsed: jest.fn()
}));

const app = require('../app');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const PasswordResetToken = require('../models/passwordResetToken');

const TEST_USER = {
  id: 42,
  email: 'test@example.com',
  password: 'hashed'
};

describe('Auth endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register creates user and returns tokens', async () => {
    User.findByEmail.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce(TEST_USER);
    RefreshToken.revokeAllForUser.mockResolvedValue();
    RefreshToken.save.mockResolvedValue({ id: 1 });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'supersecret',
        name: 'Test',
        lastname: 'User'
      })
      .expect(201);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.tokens.accessToken).toBeDefined();
    expect(response.body.data.tokens.refreshToken).toBeDefined();
  });

  test('login authenticates and returns tokens', async () => {
    User.findByEmail.mockResolvedValueOnce(TEST_USER);
    User.comparePassword.mockResolvedValueOnce(true);
    RefreshToken.revokeAllForUser.mockResolvedValue();
    RefreshToken.save.mockResolvedValue({ id: 2 });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'supersecret'
      })
      .expect(200);

    expect(User.comparePassword).toHaveBeenCalledWith('supersecret', 'hashed');
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.accessToken).toBeDefined();
  });

  test('refresh rotates refresh token', async () => {
    RefreshToken.findActiveByToken.mockResolvedValueOnce({
      id: 7,
      user_id: TEST_USER.id,
      token_hash: 'hash',
      expires_at: new Date(Date.now() + 1000 * 60 * 60)
    });
    RefreshToken.revokeById.mockResolvedValue();
    RefreshToken.revokeAllForUser.mockResolvedValue();
    RefreshToken.save.mockResolvedValue({ id: 8 });
    User.findById.mockResolvedValueOnce(TEST_USER);

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' })
      .expect(200);

    expect(RefreshToken.revokeById).toHaveBeenCalledWith(7, 'rotated');
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.refreshToken).toBeDefined();
  });

  test('request password reset generates token', async () => {
    User.findByEmail.mockResolvedValueOnce(TEST_USER);
    PasswordResetToken.create.mockResolvedValueOnce({ id: 99 });

    const response = await request(app)
      .post('/api/auth/password/request-reset')
      .send({ email: 'test@example.com' })
      .expect(200);

    expect(PasswordResetToken.create).toHaveBeenCalled();
    expect(response.body.success).toBe(true);
  });
});
