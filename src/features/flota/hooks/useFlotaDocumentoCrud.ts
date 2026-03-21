import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDocumentoSchema } from '../model/schema';

const FlotaDocumentoCrudApi = {
    create: (args: { flotaId: number; data: CreateFlotaDocumentoSchema }) => 
        flotaApi.addDocumento(args.flotaId, args.data),
    update: (args: { id: number; data: CreateFlotaDocumentoSchema }) => 
        flotaApi.updateDocumento(args.id, args.data),
    delete: (id: number) => flotaApi.removeDocumento(id)
};

export const { 
    useCreate: useCreateFlotaDocumento, 
    useUpdate: useUpdateFlotaDocumento, 
    useDelete: useDeleteFlotaDocumento 
} = createGenericCrudHooks(
    FlotaDocumentoCrudApi,
    'Documento de Flota',
    (args) => {
        if (args && typeof args === 'object' && 'flotaId' in args) {
            return [['flota-documentos', args.flotaId]];
        }
        return [['flota-documentos']];
    }
);