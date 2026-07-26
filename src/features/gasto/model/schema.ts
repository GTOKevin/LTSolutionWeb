import { z } from 'zod';

export const createGastoSchema = z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no debe exceder los 100 caracteres.'),
    codigo: z.string()
        .trim()
        .min(1, 'El código es obligatorio.')
        .max(50, 'El código no debe exceder los 50 caracteres.')
        .transform((value) => value.toUpperCase()),
    monedaCodigoDefault: z.string().trim().max(10, 'La moneda por defecto no debe exceder los 10 caracteres.').optional(),
    activo: z.boolean().default(true).optional()
});

export type CreateGastoSchema = z.infer<typeof createGastoSchema>;
