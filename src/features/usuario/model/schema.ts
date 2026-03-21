import { z } from 'zod';
import { INPUT_VAL, ERROR_MESSAGES } from '@/shared/constants/constantes';

export const baseUsuarioSchema = z.object({
    nombre: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]+$/, 'El nombre solo puede contener letras y números, sin espacios'),
    email: z.string()
        .email('Email inválido')
        .regex(/^\S*$/, 'El email no puede contener espacios')
        .optional()
        .or(z.literal('')),
    rolUsuarioID: z.number().min(1, 'El rol es requerido'),
    estadoID: z.number().min(1, 'El estado es requerido'),
    colaboradorID: z.number().optional().nullable()
});

export const createUsuarioSchemaFull = baseUsuarioSchema.extend({
    clave: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(20, 'La contraseña no debe exceder 20 caracteres')
        .regex(INPUT_VAL.PASSWORD_SIN_ESPACIOS, ERROR_MESSAGES.PASSWORD_SIN_ESPACIOS)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UNA_LETRA, ERROR_MESSAGES.PASSWORD_AL_MENOS_UNA_LETRA)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_NUMERO, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_NUMERO)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_ESPECIAL, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_ESPECIAL)
});

export const editUsuarioSchemaFull = baseUsuarioSchema.extend({
    clave: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .max(20, 'La contraseña no debe exceder 20 caracteres')
        .regex(INPUT_VAL.PASSWORD_SIN_ESPACIOS, ERROR_MESSAGES.PASSWORD_SIN_ESPACIOS)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UNA_LETRA, ERROR_MESSAGES.PASSWORD_AL_MENOS_UNA_LETRA)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_NUMERO, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_NUMERO)
        .regex(INPUT_VAL.PASSWORD_AL_MENOS_UN_ESPECIAL, ERROR_MESSAGES.PASSWORD_AL_MENOS_UN_ESPECIAL)
        .optional()
        .or(z.literal(''))
});

export type CreateUsuarioSchema = z.infer<typeof createUsuarioSchemaFull>;
export type EditUsuarioSchema = z.infer<typeof editUsuarioSchemaFull>;
export type UsuarioFormSchema = CreateUsuarioSchema | EditUsuarioSchema;
