import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { gastoApi } from '@/entities/gasto/api/gasto.api';
import type { CreateGastoDto } from '@/entities/gasto/model/types';

export const GASTO_QUERY_KEYS = {
    all: ['gastos'] as const,
    lists: () => [...GASTO_QUERY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...GASTO_QUERY_KEYS.lists(), { filters }] as const,
    details: () => [...GASTO_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...GASTO_QUERY_KEYS.details(), id] as const,
};

const genericApi = {
    create: (data: CreateGastoDto) => gastoApi.create(data),
    update: (args: { id: number; data: CreateGastoDto }) => gastoApi.update(args.id, args.data),
    delete: (id: number) => gastoApi.delete(id)
};

export const {
    useCreate: useCreateGasto,
    useUpdate: useUpdateGasto,
    useDelete: useDeleteGasto
} = createGenericCrudHooks(
    genericApi,
    'Gasto',
    (args) => {
        const keys: (readonly unknown[])[] = [GASTO_QUERY_KEYS.lists()];
        if (args && typeof args === 'object' && 'id' in args) {
            keys.push(GASTO_QUERY_KEYS.detail(args.id as number));
        }
        return keys;
    }
);
