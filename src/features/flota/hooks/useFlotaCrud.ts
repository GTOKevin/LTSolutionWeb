import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { CreateFlotaDto } from '@entities/flota/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';

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
    (args) => {
        const detailKey =
            typeof args === 'number'
                ? FLOTA_QUERY_KEYS.detail(args)
                : typeof args === 'object' && args && 'id' in args
                    ? FLOTA_QUERY_KEYS.detail(Number(args.id))
                    : null;

        return detailKey ? [FLOTA_QUERY_KEYS.all, detailKey] : [FLOTA_QUERY_KEYS.all];
    }
);
