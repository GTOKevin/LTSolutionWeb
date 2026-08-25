import { z } from 'zod';
import type { FacturaDocumento } from '@/entities/factura-documento/model/types';

export const createFacturaDocumentoSchema = z.object({
    facturaID: z.number().min(1, 'Factura es requerida'),
    descripcion: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
    rutaArchivo: z.string().min(1, 'El archivo es requerido'),
});

export type CreateFacturaDocumentoSchema = z.infer<typeof createFacturaDocumentoSchema>;

export function buildFacturaDocumentoDefaultValues(facturaId: number): CreateFacturaDocumentoSchema {
    return {
        facturaID: facturaId,
        descripcion: '',
        rutaArchivo: '',
    };
}

export function mapFacturaDocumentoToFormValues(documento: FacturaDocumento): CreateFacturaDocumentoSchema {
    return {
        facturaID: documento.facturaID,
        descripcion: documento.descripcion ?? '',
        rutaArchivo: documento.rutaArchivo,
    };
}