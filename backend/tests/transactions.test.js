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
  listByUser: jest.fn(),
  countByUser: jest.fn(),
  create: jest.fn(),
  updateForUser: jest.fn(),
  softDeleteForUser: jest.fn(),
  findByIdForUser: jest.fn(),
  findByClientIdForUser: jest.fn(),
  restoreForUser: jest.fn(),
  getSummaryForUser: jest.fn(),
  getMonthlySummaryForUser: jest.fn(),
  getCategorySummaryForUser: jest.fn()
}));

jest.mock('../models/transactionSyncQueue', () => ({
  enqueue: jest.fn()
}));

const app = require('../app');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const TransactionSyncQueue = require('../models/transactionSyncQueue');

const TEST_USER = {
  id: 11,
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

describe('Transaction endpoints', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = createToken();
    User.findById.mockResolvedValue(TEST_USER);
  });

  test('lists transactions with pagination metadata', async () => {
    Transaction.listByUser.mockResolvedValueOnce([
      { id: 1, amount: 100, type: 'income', occurred_at: new Date().toISOString() }
    ]);
    Transaction.countByUser.mockResolvedValueOnce(1);

    const response = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Transaction.listByUser).toHaveBeenCalledWith(TEST_USER.id, {
      categoryId: undefined,
      type: undefined,
      fromDate: undefined,
      toDate: undefined,
      limit: undefined,
      offset: undefined
    });
    expect(response.body.data.pagination.total).toBe(1);
  });

  test('creates a transaction', async () => {
    const created = {
      id: 5,
      amount: 45.5,
      type: 'expense',
      occurred_at: new Date().toISOString()
    };
    Transaction.create.mockResolvedValueOnce(created);

    const response = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 45.5,
        type: 'expense',
        occurredAt: new Date().toISOString()
      })
      .expect(201);

    expect(Transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: TEST_USER.id, amount: 45.5, type: 'expense' })
    );
    expect(response.body.data).toEqual(created);
  });

  test('sync endpoint persists new transactions', async () => {
    Transaction.findByClientIdForUser.mockResolvedValueOnce(null);
    Transaction.create.mockResolvedValueOnce({
      id: 10,
      amount: 30,
      type: 'income',
      updated_at: new Date().toISOString()
    });

    const response = await request(app)
      .post('/api/transactions/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            operation: 'create',
            clientId: 'mobile-123',
            type: 'income',
            amount: 30,
            occurredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      })
      .expect(200);

    expect(Transaction.create).toHaveBeenCalled();
    expect(TransactionSyncQueue.enqueue).toHaveBeenCalled();
    expect(response.body.data.results[0].status).toBe('applied');
  });
});
