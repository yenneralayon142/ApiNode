const { z } = require('zod');

const sanitizeOptionalString = (max = 255) =>
  z
    .union([
      z.string().trim().max(max, `Debe tener máximo ${max} caracteres.`),
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
  .email('El correo no es válido.');

const passwordSchema = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(128, 'La contraseña es demasiado larga.');

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: sanitizeOptionalString(90),
  lastname: sanitizeOptionalString(90),
  phone: sanitizeOptionalString(45),
  image: sanitizeOptionalString(255)
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'La contraseña es obligatoria.' }).min(1, 'La contraseña es obligatoria.')
});

const refreshSchema = z.object({
  refreshToken: z.string({ required_error: 'El refresh token es obligatorio.' }).min(10)
});

const logoutSchema = refreshSchema;

const requestPasswordResetSchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'El token es obligatorio.' })
    .regex(/^[a-f0-9]{64}$/i, 'El formato del token no es válido.'),
  newPassword: passwordSchema
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
};
