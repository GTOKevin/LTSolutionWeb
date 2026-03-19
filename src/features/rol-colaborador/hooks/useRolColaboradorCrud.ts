import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import type { CreateRolColaboradorDto } from '@entities/rol-colaborador/model/types';

const genericApi = {
    create: (data: CreateRolColaboradorDto) => rolColaboradorApi.create(data),
    update: (args: { id: number; data: CreateRolColaboradorDto }) => rolColaboradorApi.update(args.id, args.data),
    delete: (id: number) => rolColaboradorApi.delete(id)
};

export const { 
    useCreate: useCreateRolColaborador, 
    useUpdate: useUpdateRolColaborador, 
    useDelete: useDeleteRolColaborador 
} = createGenericCrudHooks(
    genericApi,
    'Rol de Colaborador',
    () => [['roles-colaborador']]
);