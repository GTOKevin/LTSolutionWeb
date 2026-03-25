import { z } from 'zod';

export const createGastoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no debe exceder los 100 caracteres.'),
    activo: z.boolean().default(true).optional()
});

export type CreateGastoSchema = z.infer<typeof createGastoSchema>;