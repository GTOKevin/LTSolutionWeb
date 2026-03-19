import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import type { CreateRolUsuarioDto } from '@entities/rol-usuario/model/types';

const genericApi = {
    create: (data: CreateRolUsuarioDto) => rolUsuarioApi.create(data),
    update: (args: { id: number; data: CreateRolUsuarioDto }) => rolUsuarioApi.update(args.id, args.data),
    delete: (id: number) => rolUsuarioApi.delete(id)
};

export const { 
    useCreate: useCreateRolUsuario, 
    useUpdate: useUpdateRolUsuario, 
    useDelete: useDeleteRolUsuario 
} = createGenericCrudHooks(
    genericApi,
    'Rol',
    () => [['roles-usuario'], ['roles-select']]
);