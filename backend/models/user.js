const db = require('../config/db');
const bcrypt = require('bcryptjs');

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });

const toPublic = (user) => {
  if (!user) {
    return null;
  }

  // Eliminamos el hash de contraseña u otros campos sensibles
  const { password, ...rest } = user;
  return rest;
};

const normalizeOptional = (value) => (value === undefined ? null : value);

const BASE_SELECT = `
  SELECT id,
         email,
         name,
         lastname,
         phone,
         image,
         password,
         created_at,
         updated_at
    FROM users
`;

const findAll = async () => {
  const sql = `${BASE_SELECT}`;
  const rows = await query(sql);
  return rows.map(toPublic);
};

const findById = async (id) => {
  const sql = `${BASE_SELECT} WHERE id = ? LIMIT 1`;
  const rows = await query(sql, [id]);
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const sql = `${BASE_SELECT} WHERE email = ? LIMIT 1`;
  const rows = await query(sql, [email]);
  return rows[0] || null;
};

const create = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const now = new Date();
  const sql = `
    INSERT INTO users (
      email,
      name,
      lastname,
      phone,
      image,
      password,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    user.email,
    normalizeOptional(user.name),
    normalizeOptional(user.lastname),
    normalizeOptional(user.phone),
    normalizeOptional(user.image),
    hashedPassword,
    now,
    now
  ];

  const result = await query(sql, params);
  const created = await findById(result.insertId);
  return toPublic(created);
};

const update = async (user) => {
  const fields = [];
  const values = [];

  if (user.email !== undefined) {
    fields.push('email = ?');
    values.push(user.email);
  }
  if (user.name !== undefined) {
    fields.push('name = ?');
    values.push(user.name);
  }
  if (user.lastname !== undefined) {
    fields.push('lastname = ?');
    values.push(user.lastname);
  }
  if (user.phone !== undefined) {
    fields.push('phone = ?');
    values.push(user.phone);
  }
  if (user.image !== undefined) {
    fields.push('image = ?');
    values.push(user.image);
  }

  if (fields.length === 0) {
    const current = await findById(user.id);
    return toPublic(current);
  }

  fields.push('updated_at = ?');
  values.push(new Date());

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  values.push(user.id);
  await query(sql, values);
  const updated = await findById(user.id);
  return toPublic(updated);
};

const remove = async (id) => {
  const sql = 'DELETE FROM users WHERE id = ?';
  const result = await query(sql, [id]);
  return {
    id,
    deleted: result.affectedRows > 0
  };
};

const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = 'UPDATE users SET password = ?, updated_at = ? WHERE id = ?';
  await query(sql, [hashedPassword, new Date(), id]);
  const updated = await findById(id);
  return toPublic(updated);
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
  comparePassword,
  updatePassword,
  toPublic
};
