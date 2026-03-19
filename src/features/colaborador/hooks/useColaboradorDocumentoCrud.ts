import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { colaboradorDocumentoApi } from '@entities/colaborador-documento/api/colaborador-documento.api';
import type { CreateColaboradorDocumentoDto } from '@entities/colaborador-documento/model/types';

const ColaboradorDocumentoCrudApi = {
    create: (args: { colaboradorId: number; data: CreateColaboradorDocumentoDto }) => 
        colaboradorDocumentoApi.create(args.colaboradorId, args.data),
    update: (args: { id: number; data: CreateColaboradorDocumentoDto }) => 
        colaboradorDocumentoApi.update(args.id, args.data),
    delete: (id: number) => colaboradorDocumentoApi.delete(id)
};

export const { 
    useCreate: useCreateColaboradorDocumento, 
    useUpdate: useUpdateColaboradorDocumento, 
    useDelete: useDeleteColaboradorDocumento 
} = createGenericCrudHooks(
    ColaboradorDocumentoCrudApi,
    'Documento de Colaborador',
    (args) => {
        if (args && typeof args === 'object' && 'colaboradorId' in args) {
            return [['colaborador-documentos', args.colaboradorId]];
        }
        return [['colaborador-documentos']];
    }
);