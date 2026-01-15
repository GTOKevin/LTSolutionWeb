import { z } from 'zod';

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
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .regex(/^\S*$/, 'La contraseña no puede contener espacios')
});

export const editUsuarioSchemaFull = baseUsuarioSchema.extend({
    clave: z.string()
        .regex(/^\S*$/, 'La contraseña no puede contener espacios')
        .optional()
});

export type CreateUsuarioSchema = z.infer<typeof createUsuarioSchemaFull>;
export type EditUsuarioSchema = z.infer<typeof editUsuarioSchemaFull>;
export type UsuarioFormSchema = CreateUsuarioSchema | EditUsuarioSchema;
