const crypto = require('crypto');
const db = require('../config/config');

const TABLE = 'password_reset_tokens';

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });

const hashToken = (token) =>
  crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

const invalidateForUser = async (userId) => {
  const sql = `
    UPDATE ${TABLE}
       SET used_at = COALESCE(used_at, NOW())
     WHERE user_id = ? AND used_at IS NULL
  `;
  await query(sql, [userId]);
};

const create = async ({ userId, token, expiresAt }) => {
  await invalidateForUser(userId);

  const tokenHash = hashToken(token);
  const sql = `
    INSERT INTO ${TABLE} (user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `;
  const now = new Date();
  const result = await query(sql, [userId, tokenHash, expiresAt, now]);
  return {
    id: result.insertId,
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_at: now
  };
};

const findActiveByToken = async (token) => {
  const tokenHash = hashToken(token);
  const sql = `
    SELECT id, user_id, token_hash, expires_at, created_at, used_at
      FROM ${TABLE}
     WHERE token_hash = ?
     LIMIT 1
  `;
  const rows = await query(sql, [tokenHash]);
  const record = rows[0];
  if (!record) {
    return null;
  }

  if (record.used_at) {
    return null;
  }

  if (new Date(record.expires_at) <= new Date()) {
    return null;
  }

  return record;
};

const markUsed = async (id) => {
  const sql = `
    UPDATE ${TABLE}
       SET used_at = ?
     WHERE id = ? AND used_at IS NULL
  `;
  await query(sql, [new Date(), id]);
};

module.exports = {
  create,
  findActiveByToken,
  markUsed,
  invalidateForUser,
  hashToken
};
