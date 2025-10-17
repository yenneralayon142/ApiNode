const { z } = require('zod');

const sanitizeOptionalString = (max = 255) =>
  z
    .union([
      z.string().trim().max(max, `Debe tener maximo ${max} caracteres.`),
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
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
      }
      return value;
    });

const emailSchema = z
  .string({ required_error: 'El correo es obligatorio.' })
  .trim()
  .toLowerCase()
  .email('El correo no es valido.');

const passwordSchema = z
  .string({ required_error: 'La contrasena es obligatoria.' })
  .min(8, 'La contrasena debe tener al menos 8 caracteres.')
  .max(128, 'La contrasena es demasiado larga.');

const profileUpdateSchema = z
  .object({
    email: emailSchema.optional(),
    name: sanitizeOptionalString(90),
    lastname: sanitizeOptionalString(90),
    phone: sanitizeOptionalString(45),
    image: sanitizeOptionalString(255)
  })
  .superRefine((data, ctx) => {
    const hasChanges = ['email', 'name', 'lastname', 'phone', 'image'].some((key) => data[key] !== undefined);
    if (!hasChanges) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes proporcionar al menos un campo para actualizar.'
      });
    }
  });

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Debes indicar tu contrasena actual.' })
      .min(1, 'Debes indicar tu contrasena actual.'),
    newPassword: passwordSchema
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contrasena debe ser diferente.',
    path: ['newPassword']
  });

module.exports = {
  profileUpdateSchema,
  changePasswordSchema
};
