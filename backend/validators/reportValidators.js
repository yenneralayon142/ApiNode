const { z } = require('zod');

const TRANSACTION_TYPES = ['income', 'expense'];

const optionalDate = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value;
  }, z.coerce.date({ invalid_type_error: 'La fecha debe ser una cadena v�lida.' }))
  .refine((value) => value === undefined || !Number.isNaN(value.getTime()), 'La fecha no es v�lida.')
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
    z.coerce.number({ invalid_type_error: 'La categor�a debe ser num�rica.' }).int('La categor�a debe ser num�rica.').positive('La categor�a debe ser positiva.'),
    z.null()
  ])
  )
  .optional();

const typeSchema = z.enum(TRANSACTION_TYPES, {
  invalid_type_error: 'El tipo no es v�lido.'
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
      .number({ invalid_type_error: 'El l�mite debe ser num�rico.' })
      .int('El l�mite debe ser num�rico.')
      .positive('El l�mite debe ser mayor que cero.')
      .max(200, 'El l�mite m�ximo permitido es 200.')
  ),
  offset: optionalNumber(
    z
      .coerce
      .number({ invalid_type_error: 'El offset debe ser num�rico.' })
      .int('El offset debe ser num�rico.')
      .min(0, 'El offset debe ser mayor o igual a cero.')
  )
});

module.exports = {
  summaryQuerySchema,
  monthlySummaryQuerySchema,
  categorySummaryQuerySchema
};
