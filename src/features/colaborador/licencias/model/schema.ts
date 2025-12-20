import { z } from 'zod';

export const createLicenciaSchema = z.object({
    colaboradorID: z.number().min(1, 'Colaborador es requerido'),
    tipoLicenciaID: z.number().min(1, 'Tipo de Licencia es requerido'),
    descripcion: z.string().optional(),
    fechaInicial: z.string().min(1, 'Fecha Inicio es requerida'),
    fechaFinal: z.string().optional().or(z.literal('')),
    activo: z.boolean().default(true)
}).refine((data) => {
    if (!data.fechaFinal) return true;
    const inicio = new Date(data.fechaInicial);
    const fin = new Date(data.fechaFinal);
    // User requirement: "La fecha inicial no puede ser menor a la fecha de vencimiento, puede ser igual pero no menor."
    // Interpreted as: FechaFinal >= FechaInicial.
    return fin >= inicio;
}, {
    message: "La fecha final debe ser mayor o igual a la fecha de inicio",
    path: ["fechaFinal"],
});

export type CreateLicenciaSchema = z.infer<typeof createLicenciaSchema>;
