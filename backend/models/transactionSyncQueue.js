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

const enqueue = async ({
  userId,
  transactionId = null,
  clientId = null,
  operation,
  payload = null,
  status = 'pending',
  message = null
}) => {
  const sql = `
    INSERT INTO transaction_sync_queue (
      user_id,
      transaction_id,
      client_id,
      operation,
      payload,
      status,
      message,
      processed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const processedAt = status === 'pending' ? null : new Date();
  await query(sql, [
    userId,
    transactionId,
    clientId,
    operation,
    payload,
    status,
    message,
    processedAt
  ]);
};

module.exports = {
  enqueue
};
