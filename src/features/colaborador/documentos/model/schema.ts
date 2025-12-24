import { z } from 'zod';

export const createColaboradorDocumentoSchema = z.object({
    colaboradorID: z.number().min(1, 'Colaborador es requerido'),
    tipoDocumentoID: z.number().min(1, 'Tipo de Documento es requerido'),
    numeroDocumento: z.string().optional(),
    rutaArchivo: z.string().optional(),
    fechaEmision: z.string().min(1, 'Fecha de Emisión es requerida'),
    fechaVencimiento: z.string().min(1, 'Fecha de Vencimiento es requerida'),
    estado: z.boolean().default(true)
}).refine((data) => {
    const emision = new Date(data.fechaEmision);
    const vencimiento = new Date(data.fechaVencimiento);
    return vencimiento >= emision;
}, {
    message: "La fecha de vencimiento debe ser posterior o igual a la de emisión",
    path: ["fechaVencimiento"],
});

export type CreateColaboradorDocumentoSchema = z.infer<typeof createColaboradorDocumentoSchema>;
