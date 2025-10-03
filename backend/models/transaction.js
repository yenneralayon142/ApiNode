const db = require('../config/config');

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });

const BASE_SELECT = `
  SELECT id,
         user_id,
         category_id,
         client_id,
         type,
         amount,
         description,
         occurred_at,
         created_at,
         updated_at,
         deleted_at
    FROM transactions
`;

const mapTransaction = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    client_id: row.client_id,
    type: row.type,
    amount: Number(row.amount),
    description: row.description,
    occurred_at: row.occurred_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at
  };
};

const buildFilters = (userId, options = {}, { includeDeleted = false, alias = '' } = {}) => {
  const prefix = alias ? `${alias}.` : '';
  const where = [`${prefix}user_id = ?`];
  const params = [userId];

  if (!includeDeleted) {
    where.push(`${prefix}deleted_at IS NULL`);
  }

  if (Object.prototype.hasOwnProperty.call(options, 'categoryId')) {
    if (options.categoryId === null) {
      where.push(`${prefix}category_id IS NULL`);
    } else if (options.categoryId !== undefined) {
      where.push(`${prefix}category_id = ?`);
      params.push(options.categoryId);
    }
  }

  if (options.type) {
    where.push(`${prefix}type = ?`);
    params.push(options.type);
  }

  if (options.fromDate) {
    where.push(`${prefix}occurred_at >= ?`);
    params.push(options.fromDate);
  }

  if (options.toDate) {
    where.push(`${prefix}occurred_at <= ?`);
    params.push(options.toDate);
  }

  return { where, params };
};

const findById = async (id) => {
  const sql = `${BASE_SELECT} WHERE id = ? LIMIT 1`;
  const rows = await query(sql, [id]);
  return mapTransaction(rows[0]);
};

const findByIdForUser = async (id, userId) => {
  const sql = `${BASE_SELECT} WHERE id = ? AND user_id = ? LIMIT 1`;
  const rows = await query(sql, [id, userId]);
  return mapTransaction(rows[0]);
};

const findByClientIdForUser = async (clientId, userId) => {
  if (!clientId) {
    return null;
  }
  const sql = `${BASE_SELECT} WHERE client_id = ? AND user_id = ? LIMIT 1`;
  const rows = await query(sql, [clientId, userId]);
  return mapTransaction(rows[0]);
};

const listByUser = async (userId, options = {}) => {
  const { where, params } = buildFilters(userId, options);
  const limit = Number(options.limit) > 0 ? Number(options.limit) : 50;
  const offset = Number(options.offset) >= 0 ? Number(options.offset) : 0;
  const sql = `${BASE_SELECT} WHERE ${where.join(' AND ')} ORDER BY occurred_at DESC, id DESC LIMIT ? OFFSET ?`;
  const rows = await query(sql, [...params, limit, offset]);
  return rows.map(mapTransaction);
};

const countByUser = async (userId, options = {}) => {
  const { where, params } = buildFilters(userId, options);
  const sql = `SELECT COUNT(*) AS total FROM transactions WHERE ${where.join(' AND ')}`;
  const rows = await query(sql, params);
  return Number(rows[0]?.total || 0);
};

const getSummaryForUser = async (userId, options = {}) => {
  const { where, params } = buildFilters(userId, options);
  const sql = `
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
      COUNT(*) AS total_transactions
    FROM transactions
    WHERE ${where.join(' AND ')}
  `;
  const rows = await query(sql, params);
  const row = rows[0] || {};
  const income = Number(row.total_income || 0);
  const expense = Number(row.total_expense || 0);
  return {
    total_income: income,
    total_expense: expense,
    balance: income - expense,
    total_transactions: Number(row.total_transactions || 0)
  };
};

const getMonthlySummaryForUser = async (userId, options = {}) => {
  const { where, params } = buildFilters(userId, options);
  const sql = `
    SELECT
      DATE_FORMAT(occurred_at, '%Y-%m') AS period,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense,
      COUNT(*) AS total
    FROM transactions
    WHERE ${where.join(' AND ')}
    GROUP BY period
    ORDER BY period ASC
  `;
  const rows = await query(sql, params);
  return rows.map((row) => {
    const income = Number(row.income || 0);
    const expense = Number(row.expense || 0);
    return {
      period: row.period,
      income,
      expense,
      balance: income - expense,
      total: Number(row.total || 0)
    };
  });
};

const getCategorySummaryForUser = async (userId, options = {}) => {
  const { where, params } = buildFilters(userId, options, { alias: 't' });
  const limit = Number(options.limit) > 0 ? Number(options.limit) : 50;
  const offset = Number(options.offset) >= 0 ? Number(options.offset) : 0;

  const baseSql = `
    FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id AND c.user_id = t.user_id
    WHERE ${where.join(' AND ')}
  `;

  const dataSql = `
    SELECT
      t.category_id,
      MAX(c.name) AS category_name,
      MAX(c.type) AS category_type,
      SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) AS income,
      SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS expense,
      COUNT(*) AS total
    ${baseSql}
    GROUP BY t.category_id
    ORDER BY category_name IS NULL, category_name ASC, t.category_id ASC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
      FROM (
        SELECT t.category_id
        ${baseSql}
        GROUP BY t.category_id
      ) AS grouped
  `;

  const [rows, countRows] = await Promise.all([
    query(dataSql, [...params, limit, offset]),
    query(countSql, params)
  ]);

  const items = rows.map((row) => {
    const income = Number(row.income || 0);
    const expense = Number(row.expense || 0);
    return {
      category_id: row.category_id,
      category_name: row.category_name || 'Sin categoría',
      category_type: row.category_type || null,
      income,
      expense,
      balance: income - expense,
      total: Number(row.total || 0)
    };
  });

  const total = Number(countRows[0]?.total || 0);

  return {
    items,
    pagination: {
      total,
      limit,
      offset
    }
  };
};

const create = async ({
  userId,
  categoryId = null,
  clientId = null,
  type,
  amount,
  description = null,
  occurredAt
}) => {
  const sql = `
    INSERT INTO transactions (
      user_id,
      category_id,
      client_id,
      type,
      amount,
      description,
      occurred_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [userId, categoryId, clientId, type, amount, description, occurredAt];
  const result = await query(sql, params);
  return findByIdForUser(result.insertId, userId);
};

const updateForUser = async ({
  id,
  userId,
  categoryId,
  clientId,
  type,
  amount,
  description,
  occurredAt
}) => {
  const fields = [];
  const values = [];

  if (categoryId !== undefined) {
    fields.push('category_id = ?');
    values.push(categoryId);
  }
  if (clientId !== undefined) {
    fields.push('client_id = ?');
    values.push(clientId);
  }
  if (type !== undefined) {
    fields.push('type = ?');
    values.push(type);
  }
  if (amount !== undefined) {
    fields.push('amount = ?');
    values.push(amount);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description);
  }
  if (occurredAt !== undefined) {
    fields.push('occurred_at = ?');
    values.push(occurredAt);
  }

  if (fields.length === 0) {
    return findByIdForUser(id, userId);
  }

  const sql = `UPDATE transactions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
  values.push(id, userId);
  await query(sql, values);
  return findByIdForUser(id, userId);
};

const softDeleteForUser = async (id, userId) => {
  const sql = `
    UPDATE transactions
       SET deleted_at = NOW()
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL
  `;
  const result = await query(sql, [id, userId]);
  return result.affectedRows > 0;
};

const restoreForUser = async (id, userId) => {
  const sql = `
    UPDATE transactions
       SET deleted_at = NULL
     WHERE id = ? AND user_id = ?
  `;
  const result = await query(sql, [id, userId]);
  return result.affectedRows > 0;
};

module.exports = {
  findById,
  findByIdForUser,
  findByClientIdForUser,
  listByUser,
  countByUser,
  getSummaryForUser,
  getMonthlySummaryForUser,
  getCategorySummaryForUser,
  create,
  updateForUser,
  softDeleteForUser,
  restoreForUser
};
