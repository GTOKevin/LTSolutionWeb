import { z } from 'zod';
import type { MiLicenciaDto } from '@entities/employee/model/types';

export const createLicenciaSolicitudSchema = z.object({
    tipoLicenciaID: z.coerce.number().int().positive('Selecciona un tipo de licencia.'),
    descripcion: z.string().max(500, 'La descripcion no puede exceder 500 caracteres.').optional(),
    fechaInicial: z.string().min(1, 'La fecha inicial es obligatoria.'),
    fechaFinal: z.string().optional(),
    rutasFoto: z.array(z.string().min(1)).optional(),
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
        rutasFoto: [],
    };
}

export function getUpdateLicenciaSolicitudDefaultValues(licencia: MiLicenciaDto): CreateLicenciaSolicitudFormInput {
    return {
        tipoLicenciaID: licencia.tipoLicenciaId,
        descripcion: licencia.descripcion ?? '',
        fechaInicial: licencia.fechaInicial,
        fechaFinal: licencia.fechaFinal ?? '',
        rutasFoto: licencia.rutasFoto ?? [],
    };
}
