import { z } from 'zod';

export const createMercaderiaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no debe exceder los 100 caracteres.'),
    activo: z.boolean().default(true).optional()
});

export type CreateMercaderiaSchema = z.infer<typeof createMercaderiaSchema>;