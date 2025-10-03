const { z } = require('zod');

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

const baseCategorySchema = {
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(120, 'El nombre es demasiado largo.'),
  type: z.enum(['income', 'expense'], {
    invalid_type_error: 'El tipo de categoría no es válido.'
  }),
  description: optionalText(255),
  color: z
    .union([
      z.string().trim().regex(/^#?[0-9a-fA-F]{6}$/, 'El color debe ser un código HEX válido.'),
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
      const normalized = value.startsWith('#') ? value : `#${value}`;
      return normalized;
    }),
  icon: optionalText(100)
};

const createCategorySchema = z
  .object({
    ...baseCategorySchema
  })
  .transform((value) => ({
    ...value,
    type: value.type || 'expense'
  }));

const updateCategorySchema = z
  .object({
    name: baseCategorySchema.name.optional(),
    type: baseCategorySchema.type.optional(),
    description: baseCategorySchema.description,
    color: baseCategorySchema.color,
    icon: baseCategorySchema.icon
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debes proporcionar al menos un campo para actualizar.'
  });

const listCategoryQuerySchema = z.object({
  type: baseCategorySchema.type.optional()
});

const categoryIdParamSchema = z.object({
  id: z.coerce.number().int('El identificador debe ser numérico.').positive('El identificador debe ser positivo.')
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  listCategoryQuerySchema,
  categoryIdParamSchema
};

