const Transaction = require('../models/transaction');
const TransactionSyncQueue = require('../models/transactionSyncQueue');

const handleUnexpectedError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
};

const normalizeAmount = (value) => {
  const amount = Number(value);
  return Math.round(amount * 100) / 100;
};

const list = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, categoryId, from, to, limit, offset } = req.query || {};

    const filters = {
      type,
      categoryId: typeof categoryId === 'number' ? categoryId : undefined,
      fromDate: from,
      toDate: to,
      limit,
      offset
    };

    const [items, total] = await Promise.all([
      Transaction.listByUser(userId, filters),
      Transaction.countByUser(userId, filters)
    ]);

    const effectiveLimit = Number(filters.limit) > 0 ? Number(filters.limit) : 50;
    const effectiveOffset = Number(filters.offset) >= 0 ? Number(filters.offset) : 0;

    return res.status(200).json({
      success: true,
      message: 'Transacciones recuperadas correctamente.',
      data: {
        items,
        pagination: {
          total,
          limit: effectiveLimit,
          offset: effectiveOffset
        }
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al listar las transacciones.');
  }
};

const show = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const transaction = await Transaction.findByIdForUser(id, userId);

    if (!transaction || transaction.deleted_at) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transacción encontrada.',
      data: transaction
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al consultar la transacción.');
  }
};

const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, type, amount, description, occurredAt, clientId } = req.body || {};

    const transaction = await Transaction.create({
      userId,
      categoryId: typeof categoryId === 'number' ? categoryId : null,
      clientId: clientId ?? null,
      type,
      amount: normalizeAmount(amount),
      description: description ?? null,
      occurredAt
    });

    return res.status(201).json({
      success: true,
      message: 'Transacción creada correctamente.',
      data: transaction
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al crear la transacción.');
  }
};

const update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { categoryId, type, amount, description, occurredAt, clientId, expectedUpdatedAt } = req.body || {};

    const current = await Transaction.findByIdForUser(id, userId);
    if (!current || current.deleted_at) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada.'
      });
    }

    if (expectedUpdatedAt) {
      const incomingVersion = expectedUpdatedAt.getTime();
      const currentVersion = new Date(current.updated_at).getTime();
      if (currentVersion > incomingVersion) {
        return res.status(409).json({
          success: false,
          message: 'La transacción fue modificada recientemente. Actualiza tu vista antes de continuar.'
        });
      }
    }

    const updates = {
      id,
      userId
    };

    if (Object.prototype.hasOwnProperty.call(req.body, 'categoryId')) {
      updates.categoryId = typeof categoryId === 'number' ? categoryId : null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'clientId')) {
      updates.clientId = clientId ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'type')) {
      updates.type = type;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'amount')) {
      updates.amount = normalizeAmount(amount);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      updates.description = description ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'occurredAt')) {
      updates.occurredAt = occurredAt;
    }

    const transaction = await Transaction.updateForUser(updates);

    return res.status(200).json({
      success: true,
      message: 'Transacción actualizada correctamente.',
      data: transaction
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al actualizar la transacción.');
  }
};

const remove = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deleted = await Transaction.softDeleteForUser(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transacción eliminada correctamente.'
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al eliminar la transacción.');
  }
};

const truncateMessage = (text) => {
  if (!text) {
    return null;
  }
  const str = String(text);
  return str.length > 250 ? `${str.slice(0, 247)}...` : str;
};

const sync = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body || {};
    const results = [];

    for (const item of items) {
      const operation = item.operation;
      const clientId = item.clientId ?? null;
      const serverId = item.id ?? item.serverId ?? null;
      const payloadSnapshot = JSON.stringify({ ...item, occurredAt: item.occurredAt, updatedAt: item.updatedAt });

      try {
        const amount = item.amount !== undefined ? normalizeAmount(item.amount) : item.amount;
        const occurredAt = item.occurredAt;
        const updatedAt = item.updatedAt || new Date();
        const categoryId = item.categoryId;
        const description = item.description ?? null;
        const type = item.type;

        let existing = null;
        if (serverId) {
          existing = await Transaction.findByIdForUser(serverId, userId);
        }
        if (!existing && clientId) {
          existing = await Transaction.findByClientIdForUser(clientId, userId);
        }

        const existingActive = existing && !existing.deleted_at;
        const existingDeleted = existing && existing.deleted_at;
        const currentUpdatedAt = existing ? new Date(existing.updated_at) : null;
        const hasConflict =
          existing && currentUpdatedAt && updatedAt instanceof Date && updatedAt.getTime() < currentUpdatedAt.getTime();

        if (operation === 'delete') {
          if (!existing) {
            await TransactionSyncQueue.enqueue({
              userId,
              clientId,
              operation,
              payload: payloadSnapshot,
              status: 'skipped',
              message: 'Transacción no encontrada en el servidor.'
            });
            results.push({
              clientId,
              operation,
              status: 'skipped',
              message: 'Transacción no encontrada en el servidor.'
            });
            continue;
          }

          if (hasConflict) {
            const message = 'Conflicto: la transacción se actualizó en el servidor.';
            await TransactionSyncQueue.enqueue({
              userId,
              transactionId: existing.id,
              clientId,
              operation,
              payload: payloadSnapshot,
              status: 'skipped',
              message: truncateMessage(message)
            });
            results.push({
              clientId,
              serverId: existing.id,
              operation,
              status: 'conflict',
              message
            });
            continue;
          }

          if (!existingActive) {
            await TransactionSyncQueue.enqueue({
              userId,
              transactionId: existing.id,
              clientId,
              operation,
              payload: payloadSnapshot,
              status: 'skipped',
              message: 'La transacción ya fue eliminada.'
            });
            results.push({
              clientId,
              serverId: existing.id,
              operation,
              status: 'skipped',
              message: 'La transacción ya fue eliminada.'
            });
            continue;
          }

          await Transaction.softDeleteForUser(existing.id, userId);
          await TransactionSyncQueue.enqueue({
            userId,
            transactionId: existing.id,
            clientId,
            operation,
            payload: payloadSnapshot,
            status: 'applied',
            message: 'Eliminación aplicada.'
          });
          results.push({
            clientId,
            serverId: existing.id,
            operation,
            status: 'applied'
          });
          continue;
        }

        if (!occurredAt) {
          throw new Error('La fecha de la transacción es obligatoria.');
        }

        if (amount === undefined || Number.isNaN(amount)) {
          throw new Error('El monto de la transacción no es válido.');
        }

        let finalCategoryId = undefined;
        if (Object.prototype.hasOwnProperty.call(item, 'categoryId')) {
          finalCategoryId = typeof categoryId === 'number' ? categoryId : null;
        }

        let resultTransaction;
        if (!existing) {
          resultTransaction = await Transaction.create({
            userId,
            categoryId: finalCategoryId === undefined ? null : finalCategoryId,
            clientId,
            type,
            amount,
            description,
            occurredAt
          });
        } else if (hasConflict) {
          const message = 'Conflicto: la transacción se actualizó en el servidor.';
          await TransactionSyncQueue.enqueue({
            userId,
            transactionId: existing.id,
            clientId,
            operation,
            payload: payloadSnapshot,
            status: 'skipped',
            message: truncateMessage(message)
          });
          results.push({
            clientId,
            serverId: existing.id,
            operation,
            status: 'conflict',
            message
          });
          continue;
        } else {
          if (existingDeleted) {
            await Transaction.restoreForUser(existing.id, userId);
          }

          const updatePayload = {
            id: existing.id,
            userId,
            type,
            amount,
            description,
            occurredAt
          };

          if (finalCategoryId !== undefined) {
            updatePayload.categoryId = finalCategoryId;
          }
          if (Object.prototype.hasOwnProperty.call(item, 'clientId')) {
            updatePayload.clientId = clientId ?? null;
          }

          resultTransaction = await Transaction.updateForUser(updatePayload);
        }

        await TransactionSyncQueue.enqueue({
          userId,
          transactionId: resultTransaction.id,
          clientId,
          operation,
          payload: payloadSnapshot,
          status: 'applied',
          message: 'Sincronización aplicada.'
        });

        results.push({
          clientId,
          serverId: resultTransaction.id,
          operation,
          status: 'applied',
          updatedAt: resultTransaction.updated_at
        });
      } catch (err) {
        const message = err.message || 'Error desconocido durante la sincronización.';
        await TransactionSyncQueue.enqueue({
          userId,
          clientId,
          operation,
          payload: payloadSnapshot,
          status: 'error',
          message: truncateMessage(message)
        });
        results.push({
          clientId,
          operation,
          status: 'error',
          message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Sincronización procesada.',
      data: {
        results
      }
    });
  } catch (error) {
    return handleUnexpectedError(res, error, 'Error al sincronizar las transacciones.');
  }
};

module.exports = {
  list,
  show,
  create,
  update,
  remove,
  sync
};
