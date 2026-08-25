import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { facturaDocumentoApi } from '@entities/factura-documento/api/factura-documento.api';
import type { CreateFacturaDocumentoDto } from '@entities/factura-documento/model/types';

const FacturaDocumentoCrudApi = {
    create: (args: { facturaId: number; data: CreateFacturaDocumentoDto }) =>
        facturaDocumentoApi.create(args.facturaId, args.data),
    update: (args: { id: number; data: { descripcion?: string; rutaArchivo: string } }) =>
        facturaDocumentoApi.update(args.id, args.data),
    delete: (id: number) => facturaDocumentoApi.remove(id),
};

export const {
    useCreate: useCreateFacturaDocumento,
    useUpdate: useUpdateFacturaDocumento,
    useDelete: useDeleteFacturaDocumento,
} = createGenericCrudHooks(
    FacturaDocumentoCrudApi,
    'Documento de Factura',
    (args) => {
        if (args && typeof args === 'object' && 'facturaId' in args) {
            return [['factura-documentos', args.facturaId], ['factura', args.facturaId]];
        }
        return [['factura-documentos']];
    },
);