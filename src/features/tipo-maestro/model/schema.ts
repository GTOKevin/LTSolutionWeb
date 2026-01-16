import { z } from 'zod';

export const tipoMaestroSchema = z.object({
    nombre: z.string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder los 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
    codigo: z.string().optional(),
    seccion: z.string()
        .min(1, 'La sección es requerida')
        .max(50, 'La sección no puede exceder los 50 caracteres'),
    activo: z.boolean().default(true),
});

export type TipoMaestroSchema = z.infer<typeof tipoMaestroSchema>;
