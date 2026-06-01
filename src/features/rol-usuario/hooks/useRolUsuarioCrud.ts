import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { permisoApi } from '@entities/permiso/api/permiso.api';
import type { CreateRolUsuarioDto } from '@entities/rol-usuario/model/types';

const genericApi = {
    create: async (data: CreateRolUsuarioDto) => {
        const id = await rolUsuarioApi.create(data);
        if (data.permisosIds) {
            await permisoApi.updateRolPermisos(id, data.permisosIds);
        }
        return id;
    },
    update: async (args: { id: number; data: CreateRolUsuarioDto }) => {
        await rolUsuarioApi.update(args.id, args.data);
        if (args.data.permisosIds) {
            await permisoApi.updateRolPermisos(args.id, args.data.permisosIds);
        }
    },
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