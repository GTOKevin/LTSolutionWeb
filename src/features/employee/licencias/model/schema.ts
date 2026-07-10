import { z } from 'zod';

export const createLicenciaSolicitudSchema = z.object({
    tipoLicenciaID: z.coerce.number().int().positive('Selecciona un tipo de licencia.'),
    descripcion: z.string().max(500, 'La descripcion no puede exceder 500 caracteres.').optional(),
    fechaInicial: z.string().min(1, 'La fecha inicial es obligatoria.'),
    fechaFinal: z.string().optional(),
}).refine((value) => !value.fechaFinal || value.fechaFinal >= value.fechaInicial, {
    message: 'La fecha final debe ser mayor o igual a la fecha inicial.',
    path: ['fechaFinal'],
});

export type CreateLicenciaSolicitudForm = z.infer<typeof createLicenciaSolicitudSchema>;
export type CreateLicenciaSolicitudFormInput = z.input<typeof createLicenciaSolicitudSchema>;

export function getCreateLicenciaSolicitudDefaultValues(): CreateLicenciaSolicitudFormInput {
    return {
        tipoLicenciaID: undefined,
        descripcion: '',
        fechaInicial: '',
        fechaFinal: '',
    };
}
