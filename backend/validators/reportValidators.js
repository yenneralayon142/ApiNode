const { z } = require('zod');

const TRANSACTION_TYPES = ['income', 'expense'];

const optionalDate = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value;
  }, z.coerce.date({ invalid_type_error: 'La fecha debe ser una cadena válida.' }))
  .refine((value) => value === undefined || !Number.isNaN(value.getTime()), 'La fecha no es válida.')
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
    z.coerce.number({ invalid_type_error: 'La categoría debe ser numérica.' }).int('La categoría debe ser numérica.').positive('La categoría debe ser positiva.'),
    z.null()
  ])
  )
  .optional();

const typeSchema = z.enum(TRANSACTION_TYPES, {
  invalid_type_error: 'El tipo no es válido.'
});

const optionalNumber = (schema) =>
  z
    .preprocess((value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }
      return value;
    }, schema.optional());

const baseFiltersSchema = z.object({
  from: optionalDate,
  to: optionalDate,
  categoryId: categoryIdSchema,
  type: typeSchema.optional()
});

const summaryQuerySchema = baseFiltersSchema;
const monthlySummaryQuerySchema = baseFiltersSchema;
const categorySummaryQuerySchema = baseFiltersSchema.extend({
  limit: optionalNumber(
    z
      .coerce
      .number({ invalid_type_error: 'El límite debe ser numérico.' })
      .int('El límite debe ser numérico.')
      .positive('El límite debe ser mayor que cero.')
      .max(200, 'El límite máximo permitido es 200.')
  ),
  offset: optionalNumber(
    z
      .coerce
      .number({ invalid_type_error: 'El offset debe ser numérico.' })
      .int('El offset debe ser numérico.')
      .min(0, 'El offset debe ser mayor o igual a cero.')
  )
});

module.exports = {
  summaryQuerySchema,
  monthlySummaryQuerySchema,
  categorySummaryQuerySchema
};
