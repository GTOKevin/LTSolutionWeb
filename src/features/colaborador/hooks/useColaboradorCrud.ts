import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import type { CreateColaboradorDto } from '@entities/colaborador/model/types';

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
    () => [['colaboradores']]
);
