const crypto = require('crypto');
const db = require('../config/config');

const TABLE = 'user_refresh_tokens';

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

const save = async ({ userId, token, expiresAt }) => {
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

const findByTokenHash = async (tokenHash) => {
  const sql = `
    SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
      FROM ${TABLE}
     WHERE token_hash = ?
     LIMIT 1
  `;
  const rows = await query(sql, [tokenHash]);
  return rows[0] || null;
};

const findActiveByToken = async (token) => {
  const tokenHash = hashToken(token);
  const record = await findByTokenHash(tokenHash);
  if (!record) {
    return null;
  }

  if (record.revoked_at) {
    return null;
  }

  const now = new Date();
  if (new Date(record.expires_at) <= now) {
    return null;
  }

  return record;
};

const revokeById = async (id, reason = null) => {
  const sql = `
    UPDATE ${TABLE}
       SET revoked_at = ?, revoke_reason = ?
     WHERE id = ? AND revoked_at IS NULL
  `;
  await query(sql, [new Date(), reason, id]);
};

const revokeByToken = async (token) => {
  const tokenHash = hashToken(token);
  const sql = `
    UPDATE ${TABLE}
       SET revoked_at = ?
     WHERE token_hash = ? AND revoked_at IS NULL
  `;
  await query(sql, [new Date(), tokenHash]);
};

const revokeAllForUser = async (userId) => {
  const sql = `
    UPDATE ${TABLE}
       SET revoked_at = ?
     WHERE user_id = ? AND revoked_at IS NULL
  `;
  await query(sql, [new Date(), userId]);
};

module.exports = {
  save,
  findActiveByToken,
  revokeById,
  revokeByToken,
  revokeAllForUser,
  hashToken
};
