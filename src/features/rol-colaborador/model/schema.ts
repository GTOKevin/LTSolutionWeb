import { z } from 'zod';

export const rolColaboradorSchema = z.object({
    nombre: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder los 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    descripcion: z.string()
        .max(200, 'La descripción no puede exceder los 200 caracteres')
        .optional()
        .or(z.literal('')),
    activo: z.boolean()
});

export type RolColaboradorSchema = z.infer<typeof rolColaboradorSchema>;
