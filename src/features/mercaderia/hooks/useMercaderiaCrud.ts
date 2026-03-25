import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { mercaderiaApi } from '@/entities/mercaderia/api/mercaderia.api';
import type { CreateMercaderiaDto } from '@/entities/mercaderia/model/types';

export const MERCADERIA_QUERY_KEYS = {
    all: ['mercaderias'] as const,
    lists: () => [...MERCADERIA_QUERY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...MERCADERIA_QUERY_KEYS.lists(), { filters }] as const,
    details: () => [...MERCADERIA_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...MERCADERIA_QUERY_KEYS.details(), id] as const,
};

const genericApi = {
    create: (data: CreateMercaderiaDto) => mercaderiaApi.create(data),
    update: (args: { id: number; data: CreateMercaderiaDto }) => mercaderiaApi.update(args.id, args.data),
    delete: (id: number) => mercaderiaApi.delete(id)
};

export const {
    useCreate: useCreateMercaderia,
    useUpdate: useUpdateMercaderia,
    useDelete: useDeleteMercaderia
} = createGenericCrudHooks(
    genericApi,
    'Mercaderia',
    (args) => {
        const keys: (readonly unknown[])[] = [MERCADERIA_QUERY_KEYS.lists()];
        if (args && typeof args === 'object' && 'id' in args) {
            keys.push(MERCADERIA_QUERY_KEYS.detail(args.id as number));
        }
        return keys;
    }
);