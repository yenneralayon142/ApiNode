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

jest.mock('../models/transaction', () => ({
  getSummaryForUser: jest.fn(),
  getMonthlySummaryForUser: jest.fn(),
  getCategorySummaryForUser: jest.fn()
}));

const app = require('../app');
const User = require('../models/user');
const Transaction = require('../models/transaction');

const TEST_USER = {
  id: 77,
  email: 'reports@example.com'
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

describe('Report endpoints', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = createToken();
    User.findById.mockResolvedValue(TEST_USER);
  });

  test('returns summary data', async () => {
    Transaction.getSummaryForUser.mockResolvedValueOnce({
      total_income: 500,
      total_expense: 200,
      balance: 300,
      total_transactions: 4
    });

    const response = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Transaction.getSummaryForUser).toHaveBeenCalledWith(TEST_USER.id, expect.any(Object));
    expect(response.body.data.total_income).toBe(500);
  });

  test('returns monthly aggregates', async () => {
    Transaction.getMonthlySummaryForUser.mockResolvedValueOnce([
      { period: '2025-01', income: 200, expense: 50, balance: 150, total: 3 }
    ]);

    const response = await request(app)
      .get('/api/reports/monthly')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data[0].period).toBe('2025-01');
  });

  test('returns category summary with pagination', async () => {
    Transaction.getCategorySummaryForUser.mockResolvedValueOnce({
      items: [
        { category_id: 1, category_name: 'Comida', income: 0, expense: 120, balance: -120, total: 5 }
      ],
      pagination: { total: 1, limit: 50, offset: 0 }
    });

    const response = await request(app)
      .get('/api/reports/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination.total).toBe(1);
  });
});
