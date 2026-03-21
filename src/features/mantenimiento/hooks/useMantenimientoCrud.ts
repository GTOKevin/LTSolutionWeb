import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { CreateMantenimientoSchema } from '../model/schema';

const mantenimientpoCrudApi = {
    create: (data: CreateMantenimientoSchema) => mantenimientoApi.create(data),
    update: (args: { id: number; data: CreateMantenimientoSchema }) => mantenimientoApi.update(args.id, args.data),
    delete: (id: number) => mantenimientoApi.delete(id)
};

export const { 
    useCreate: useCreateMantenimiento, 
    useUpdate: useUpdateMantenimiento, 
    useDelete: useDeleteMantenimiento 
} = createGenericCrudHooks(
    mantenimientpoCrudApi,
    'Mantenimiento',
    () => [['mantenimientos']]
);