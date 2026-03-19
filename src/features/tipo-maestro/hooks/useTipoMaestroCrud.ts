import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import type { TipoMaestroSchema } from '../model/schema';

const genericApi = {
    create: (data: TipoMaestroSchema) => tipoMaestroApi.create(data),
    update: (args: { id: number; data: TipoMaestroSchema }) => tipoMaestroApi.update(args.id, args.data),
    delete: (id: number) => tipoMaestroApi.delete(id)
};

export const { 
    useCreate: useCreateTipoMaestro, 
    useUpdate: useUpdateTipoMaestro, 
    useDelete: useDeleteTipoMaestro 
} = createGenericCrudHooks(
    genericApi,
    'Maestro',
    () => [['tipo-maestros'], ['secciones-maestro']]
);