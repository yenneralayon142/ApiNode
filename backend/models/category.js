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
         name,
         type,
         description,
         color,
         icon,
         created_at,
         updated_at
    FROM categories
`;

const mapCategory = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    description: row.description,
    color: row.color,
    icon: row.icon,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

const findAllByUser = async (userId, filters = {}) => {
  const where = ['user_id = ?', '1 = 1'];
  const params = [userId];

  if (filters.type) {
    where.push('type = ?');
    params.push(filters.type);
  }

  const sql = `${BASE_SELECT} WHERE ${where.join(' AND ')} ORDER BY name ASC`;
  const rows = await query(sql, params);
  return rows.map(mapCategory);
};

const findByIdForUser = async (id, userId) => {
  const sql = `${BASE_SELECT} WHERE id = ? AND user_id = ? LIMIT 1`;
  const rows = await query(sql, [id, userId]);
  return mapCategory(rows[0]);
};

const create = async ({ userId, name, type, description = null, color = null, icon = null }) => {
  const sql = `
    INSERT INTO categories (
      user_id,
      name,
      type,
      description,
      color,
      icon
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [userId, name, type, description, color, icon];
  const result = await query(sql, params);
  return findByIdForUser(result.insertId, userId);
};

const updateForUser = async ({ id, userId, ...changes }) => {
  const fields = [];
  const values = [];

  if (changes.name !== undefined) {
    fields.push('name = ?');
    values.push(changes.name);
  }
  if (changes.type !== undefined) {
    fields.push('type = ?');
    values.push(changes.type);
  }
  if (changes.description !== undefined) {
    fields.push('description = ?');
    values.push(changes.description);
  }
  if (changes.color !== undefined) {
    fields.push('color = ?');
    values.push(changes.color);
  }
  if (changes.icon !== undefined) {
    fields.push('icon = ?');
    values.push(changes.icon);
  }

  if (fields.length === 0) {
    return findByIdForUser(id, userId);
  }

  const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
  values.push(id, userId);
  await query(sql, values);
  return findByIdForUser(id, userId);
};

const removeForUser = async (id, userId) => {
  const sql = 'DELETE FROM categories WHERE id = ? AND user_id = ?';
  const result = await query(sql, [id, userId]);
  return result.affectedRows > 0;
};

module.exports = {
  findAllByUser,
  findByIdForUser,
  create,
  updateForUser,
  removeForUser
};
