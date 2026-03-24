import { z } from 'zod';

export const createTipoProductoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no debe exceder los 100 caracteres.'),
    tipo: z.string().min(1, 'El tipo es obligatorio.').max(50, 'El tipo no debe exceder los 50 caracteres.'),
    categoria: z.string().min(1, 'La categoría es obligatoria.').max(50, 'La categoría no debe exceder los 50 caracteres.'),
    activo: z.boolean().default(true)
});

export type CreateTipoProductoSchema = z.infer<typeof createTipoProductoSchema>;