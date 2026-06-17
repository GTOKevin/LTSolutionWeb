import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

export const selfChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z.string()
        .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
        .max(20, 'La nueva contraseña no debe exceder 20 caracteres')
        .regex(INPUT_VAL.PASSWORD_SIN_ESPACIOS, ERROR_MESSAGES.PASSWORD_SIN_ESPACIOS)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UNA_LETRA, ERROR_MESSAGES.PASSWORD_AL_MENOS_UNA_LETRA)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_NUMERO, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_NUMERO)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_ESPECIAL, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_ESPECIAL),
    confirmPassword: z.string().min(1, 'Confirmar contraseña es requerida'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
});

export type SelfChangePasswordSchema = z.infer<typeof selfChangePasswordSchema>;
