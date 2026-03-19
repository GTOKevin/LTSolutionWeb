import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { usuarioApi } from '@entities/usuario/api/usuario.api';
import type { CreateUsuarioDto } from '@entities/usuario/model/types';

const genericApi = {
    create: (data: CreateUsuarioDto) => usuarioApi.create(data),
    update: (args: { id: number; data: CreateUsuarioDto }) => usuarioApi.update(args.id, args.data),
    delete: (id: number) => usuarioApi.delete(id)
};

export const { 
    useCreate: useCreateUsuario, 
    useUpdate: useUpdateUsuario, 
    useDelete: useDeleteUsuario 
} = createGenericCrudHooks(
    genericApi,
    'Usuario',
    () => [['usuarios']]
);