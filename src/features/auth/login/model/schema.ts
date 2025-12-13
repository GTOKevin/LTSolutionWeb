import { z } from 'zod';

export const loginSchema = z.object({
    nombre: z.string().min(1, 'El nombre de usuario es requerido'),
    clave: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
