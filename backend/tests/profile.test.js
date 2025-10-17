const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/user', () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  comparePassword: jest.fn(),
  updatePassword: jest.fn(),
  toPublic: jest.fn((user) => {
    if (!user || typeof user !== 'object') {
      return user;
    }
    const { password, ...rest } = user;
    return rest;
  })
}));

jest.mock('../models/refreshToken', () => ({
  save: jest.fn(),
  findActiveByToken: jest.fn(),
  revokeById: jest.fn(),
  revokeByToken: jest.fn(),
  revokeAllForUser: jest.fn(),
  hashToken: jest.fn()
}));

const app = require('../app');
const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');

const TEST_USER = {
  id: 21,
  email: 'profile@example.com',
  name: 'Profile',
  lastname: 'Tester',
  phone: '12345678',
  image: null,
  password: 'hashed-password'
};

const createToken = () =>
  jwt.sign(
    {
      sub: TEST_USER.id,
      email: TEST_USER.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

describe('Profile endpoints', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = createToken();
    User.findById.mockResolvedValue(TEST_USER);
    User.toPublic.mockImplementation((user) => {
      if (!user || typeof user !== 'object') {
        return user;
      }
      const { password, ...rest } = user;
      return rest;
    });
  });

  test('GET /api/profile devuelve el perfil del usuario autenticado', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(User.findById).toHaveBeenCalledTimes(2);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(TEST_USER.email);
  });

  test('PATCH /api/profile actualiza los campos permitidos', async () => {
    const updatedUser = {
      id: TEST_USER.id,
      email: TEST_USER.email,
      name: 'Nuevo Nombre',
      lastname: TEST_USER.lastname,
      phone: '555-1234',
      image: null
    };
    User.update.mockResolvedValueOnce(updatedUser);

    const response = await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: ' Nuevo Nombre ' })
      .expect(200);

    expect(User.findByEmail).not.toHaveBeenCalled();
    expect(User.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: TEST_USER.id, name: 'Nuevo Nombre' })
    );
    expect(response.body.data).toEqual(updatedUser);
  });

  test('PATCH /api/profile rechaza un correo duplicado', async () => {
    User.findByEmail.mockResolvedValueOnce({ id: 99, email: 'taken@example.com' });

    await request(app)
      .patch('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'taken@example.com' })
      .expect(409);

    expect(User.update).not.toHaveBeenCalled();
  });

  test('PUT /api/profile/password actualiza la contrasena', async () => {
    User.comparePassword.mockResolvedValueOnce(true);
    User.updatePassword.mockResolvedValueOnce({ id: TEST_USER.id });

    const response = await request(app)
      .put('/api/profile/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpass123', newPassword: 'newpass123' })
      .expect(200);

    expect(User.comparePassword).toHaveBeenCalledWith('oldpass123', TEST_USER.password);
    expect(User.updatePassword).toHaveBeenCalledWith(TEST_USER.id, 'newpass123');
    expect(RefreshToken.revokeAllForUser).toHaveBeenCalledWith(TEST_USER.id);
    expect(response.body.success).toBe(true);
  });

  test('PUT /api/profile/password responde 400 si la contrasena actual es invalida', async () => {
    User.comparePassword.mockResolvedValueOnce(false);

    const response = await request(app)
      .put('/api/profile/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrong', newPassword: 'newpass123' })
      .expect(400);

    expect(User.updatePassword).not.toHaveBeenCalled();
    expect(RefreshToken.revokeAllForUser).not.toHaveBeenCalled();
    expect(response.body.success).toBe(false);
  });
});
