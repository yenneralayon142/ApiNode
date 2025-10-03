const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/user', () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  comparePassword: jest.fn(),
  toPublic: jest.fn((user) => user),
  findById: jest.fn(),
  updatePassword: jest.fn()
}));

jest.mock('../models/category', () => ({
  findAllByUser: jest.fn(),
  findByIdForUser: jest.fn(),
  create: jest.fn(),
  updateForUser: jest.fn(),
  removeForUser: jest.fn()
}));

const app = require('../app');
const User = require('../models/user');
const Category = require('../models/category');

const TEST_USER = {
  id: 99,
  email: 'owner@example.com'
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

describe('Category endpoints', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = createToken();
    User.findById.mockResolvedValue(TEST_USER);
  });

  test('lists categories for authenticated user', async () => {
    const categories = [
      { id: 1, name: 'Comida', type: 'expense' }
    ];
    Category.findAllByUser.mockResolvedValueOnce(categories);

    const response = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Category.findAllByUser).toHaveBeenCalledWith(TEST_USER.id, { type: undefined });
    expect(response.body.data).toEqual(categories);
  });

  test('creates a new category', async () => {
    const category = { id: 2, name: 'Salario', type: 'income' };
    Category.create.mockResolvedValueOnce(category);

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Salario',
        type: 'income'
      })
      .expect(201);

    expect(Category.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: TEST_USER.id, name: 'Salario', type: 'income' })
    );
    expect(response.body.data).toEqual(category);
  });

  test('updates a category', async () => {
    const updated = { id: 3, name: 'Transporte', type: 'expense' };
    Category.updateForUser.mockResolvedValueOnce(updated);

    const response = await request(app)
      .put('/api/categories/3')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Transporte' })
      .expect(200);

    expect(Category.updateForUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, userId: TEST_USER.id, name: 'Transporte' })
    );
    expect(response.body.data).toEqual(updated);
  });
});

