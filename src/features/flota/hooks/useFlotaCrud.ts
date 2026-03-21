import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDto } from '@entities/flota/model/types';

const genericApi = {
    create: (data: CreateFlotaDto) => flotaApi.create(data),
    update: (args: { id: number; data: CreateFlotaDto }) => flotaApi.update(args.id, args.data),
    delete: (id: number) => flotaApi.delete(id)
};

export const { 
    useCreate: useCreateFlota, 
    useUpdate: useUpdateFlota, 
    useDelete: useDeleteFlota 
} = createGenericCrudHooks(
    genericApi,
    'Flota',
    () => [['flotas']]
);
