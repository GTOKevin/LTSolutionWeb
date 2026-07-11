import { z } from 'zod';

export const createSolicitudActualizacionSchema = z.object({
    colaboradorDocumentoID: z.coerce.number().int().positive('Selecciona un documento.'),
    numeroDocumentoPropuesto: z.string().max(100, 'El número propuesto es demasiado largo.').optional(),
    rutaArchivoPropuesta: z.string().max(500, 'La ruta del archivo es demasiado larga.').optional(),
    fechaEmisionPropuesta: z.string().optional(),
    fechaVencimientoPropuesta: z.string().optional(),
    motivoSolicitud: z.string().max(500, 'El motivo no puede exceder 500 caracteres.').optional(),
}).refine((value) => {
    return Boolean(
        value.numeroDocumentoPropuesto?.trim()
        || value.rutaArchivoPropuesta?.trim()
        || value.fechaEmisionPropuesta
        || value.fechaVencimientoPropuesta
        || value.motivoSolicitud?.trim()
    );
}, {
    message: 'Debes proponer al menos un cambio o indicar el motivo de la solicitud.',
    path: ['motivoSolicitud'],
}).refine((value) => {
    if (!value.fechaEmisionPropuesta || !value.fechaVencimientoPropuesta) {
        return true;
    }

    return value.fechaEmisionPropuesta <= value.fechaVencimientoPropuesta;
}, {
    message: 'La fecha de vencimiento debe ser mayor o igual a la de emisión.',
    path: ['fechaVencimientoPropuesta'],
});

export type CreateSolicitudActualizacionForm = z.infer<typeof createSolicitudActualizacionSchema>;
export type CreateSolicitudActualizacionFormInput = z.input<typeof createSolicitudActualizacionSchema>;

export function getCreateSolicitudActualizacionDefaultValues(initialDocumentoId?: number): CreateSolicitudActualizacionFormInput {
    return {
        colaboradorDocumentoID: initialDocumentoId,
        numeroDocumentoPropuesto: '',
        rutaArchivoPropuesta: '',
        fechaEmisionPropuesta: '',
        fechaVencimientoPropuesta: '',
        motivoSolicitud: '',
    };
}
