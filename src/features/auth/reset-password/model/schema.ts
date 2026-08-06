import { z } from 'zod';

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(20, 'La contraseña no puede exceder 20 caracteres')
        .regex(/^\S+$/, 'La contraseña no puede contener espacios')
        .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra')
        .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')
        .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir al menos un caracter especial'),
    confirmPassword: z.string().min(1, 'Confirma la contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
