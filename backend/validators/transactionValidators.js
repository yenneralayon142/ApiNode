const { z } = require('zod');

const TRANSACTION_TYPES = ['income', 'expense'];

const optionalText = (max = 255) =>
  z
    .union([
      z.string().trim().max(max),
      z.literal('').transform(() => null),
      z.null()
    ])
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      if (value === null) {
        return null;
      }
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    });

const optionalNumber = (schema) =>
  z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      return value;
    }, schema.optional());

const optionalDate = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value;
  },
  z
    .coerce
    .date({ invalid_type_error: 'La fecha debe ser una cadena válida.' })
    .refine((value) => !Number.isNaN(value.getTime()), 'La fecha proporcionada no es válida.')
  )
  .optional();

const categoryIdSchema = z
  .preprocess((value) => {
    if (value === undefined || value === '') {
      return undefined;
    }
    if (value === null) {
      return null;
    }
    return value;
  },
  z.union([
    z
      .coerce
      .number({ invalid_type_error: 'La categoría debe ser numérica.' })
      .int('La categoría debe ser numérica.')
      .positive('La categoría debe ser positiva.'),
    z.null()
  ])
  )
  .optional();

const amountSchema = z
  .coerce.number({ invalid_type_error: 'El monto debe ser numérico.' })
  .refine((value) => Number.isFinite(value), 'El monto debe ser un número válido.');

const typeSchema = z.enum(TRANSACTION_TYPES, {
  invalid_type_error: 'El tipo no es válido.'
});

const listTransactionQuerySchema = z.object({
  type: typeSchema.optional(),
  categoryId: categoryIdSchema,
  from: optionalDate,
  to: optionalDate,
  limit: optionalNumber(
    z
      .coerce
      .number({ invalid_type_error: 'El límite debe ser numérico.' })
      .int('El límite debe ser numérico.')
      .positive('El límite debe ser mayor que cero.')
      .max(500, 'El límite máximo permitido es 500.')
  ),
  offset: optionalNumber(
    z
      .coerce
      .number({ invalid_type_error: 'El offset debe ser numérico.' })
      .int('El offset debe ser numérico.')
      .min(0, 'El offset debe ser mayor o igual a cero.')
  )
});

const createTransactionSchema = z.object({
  categoryId: categoryIdSchema,
  type: typeSchema,
  amount: amountSchema,
  description: optionalText(255),
  occurredAt: z
    .coerce
    .date({ invalid_type_error: 'La fecha debe ser una cadena válida.' })
    .refine((value) => !Number.isNaN(value.getTime()), 'La fecha proporcionada no es válida.'),
  clientId: optionalText(100)
});

const updateTransactionSchema = z
  .object({
    categoryId: categoryIdSchema,
    type: typeSchema.optional(),
    amount: optionalNumber(amountSchema),
    description: optionalText(255),
    occurredAt: optionalDate,
    clientId: optionalText(100),
    expectedUpdatedAt: optionalDate
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'Debes proporcionar al menos un campo para actualizar.'
  });

const transactionIdParamSchema = z.object({
  id: z
    .coerce
    .number({ invalid_type_error: 'El identificador debe ser numérico.' })
    .int('El identificador debe ser numérico.')
    .positive('El identificador debe ser positivo.')
});

const syncTransactionItemSchema = z
  .object({
    operation: z.enum(['create', 'update', 'delete']),
    id: optionalNumber(
      z
        .coerce
        .number({ invalid_type_error: 'El identificador debe ser numérico.' })
        .int('El identificador debe ser numérico.')
        .positive('El identificador debe ser positivo.')
    ),
    serverId: optionalNumber(
      z
        .coerce
        .number({ invalid_type_error: 'El identificador debe ser numérico.' })
        .int('El identificador debe ser numérico.')
        .positive('El identificador debe ser positivo.')
    ),
    clientId: optionalText(100),
    categoryId: categoryIdSchema,
    type: typeSchema.optional(),
    amount: optionalNumber(amountSchema),
    description: optionalText(255),
    occurredAt: optionalDate,
    updatedAt: optionalDate
  })
  .superRefine((value, ctx) => {
    if (value.operation === 'delete') {
      return;
    }
    if (!value.type) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['type'],
        message: 'El tipo es obligatorio para crear o actualizar.'
      });
    }
    if (value.amount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['amount'],
        message: 'El monto es obligatorio para crear o actualizar.'
      });
    }
    if (!value.occurredAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['occurredAt'],
        message: 'La fecha es obligatoria para crear o actualizar.'
      });
    }
  });

const syncTransactionsSchema = z.object({
  items: z.array(syncTransactionItemSchema).min(1, 'Debes enviar al menos una transacción para sincronizar.')
});

module.exports = {
  listTransactionQuerySchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamSchema,
  syncTransactionsSchema
};
