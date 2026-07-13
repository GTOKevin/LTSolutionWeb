import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

export const changePasswordSchema = z.object({
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(20, 'La contraseña no debe exceder 20 caracteres')
        .regex(INPUT_VAL.PASSWORD_SIN_ESPACIOS, ERROR_MESSAGES.PASSWORD_SIN_ESPACIOS)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UNA_LETRA, ERROR_MESSAGES.PASSWORD_AL_MENOS_UNA_LETRA)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_NUMERO, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_NUMERO)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_ESPECIAL, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_ESPECIAL),
    confirmPassword: z.string().min(1, 'Confirmar contraseña es requerida')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
