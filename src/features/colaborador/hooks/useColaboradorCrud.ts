import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import type { CreateColaboradorDto } from '@entities/colaborador/model/types';
import { COLABORADOR_QUERY_KEYS } from '@features/colaborador/model/query-keys';

const genericApi = {
    create: (data: CreateColaboradorDto) => colaboradorApi.create(data),
    update: (args: { id: number; data: CreateColaboradorDto }) => colaboradorApi.update(args.id, args.data),
    delete: (id: number) => colaboradorApi.delete(id)
};

export const { 
    useCreate: useCreateColaborador, 
    useUpdate: useUpdateColaborador, 
    useDelete: useDeleteColaborador 
} = createGenericCrudHooks(
    genericApi,
    'Colaborador',
    (args) => {
        const detailKey =
            typeof args === 'number'
                ? COLABORADOR_QUERY_KEYS.detail(args)
                : typeof args === 'object' && args && 'id' in args
                    ? COLABORADOR_QUERY_KEYS.detail(Number(args.id))
                    : null;

        return detailKey ? [COLABORADOR_QUERY_KEYS.all, detailKey] : [COLABORADOR_QUERY_KEYS.all];
    }
);
