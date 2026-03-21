import { z } from 'zod';
import { ERROR_MESSAGES, INPUT_VAL } from '@/shared/constants/constantes';

export const createLicenciaSchema = z.object({
    colaboradorID: z.number().min(1, 'Colaborador es requerido'),
    tipoLicenciaID: z.number().min(1, 'Tipo de Licencia es requerido'),
    descripcion: z.string().regex(INPUT_VAL.ALPHA_NUMERICO_ESPECIAL, ERROR_MESSAGES.ALPHA_NUMERICO_ESPECIAL).optional().or(z.literal('')),
    fechaInicial: z.string().min(1, 'Fecha Inicio es requerida'),
    fechaFinal: z.string().optional().or(z.literal('')),
    activo: z.boolean().default(true)
}).refine((data) => {
    if (!data.fechaFinal) return true;
    const inicio = new Date(data.fechaInicial);
    const fin = new Date(data.fechaFinal);
    return fin >= inicio;
}, {
    message: "La fecha final debe ser mayor o igual a la fecha de inicio",
    path: ["fechaFinal"],
});

export type CreateLicenciaSchema = z.infer<typeof createLicenciaSchema>;
