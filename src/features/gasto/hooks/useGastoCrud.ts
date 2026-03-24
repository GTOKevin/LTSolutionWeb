import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gastoApi } from '@/entities/gasto/api/gasto.api';
import type { CreateGastoDto } from '@/entities/gasto/model/types';

export const GASTO_QUERY_KEYS = {
    all: ['gastos'] as const,
    lists: () => [...GASTO_QUERY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...GASTO_QUERY_KEYS.lists(), { filters }] as const,
    details: () => [...GASTO_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...GASTO_QUERY_KEYS.details(), id] as const,
};

export const useCreateGasto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGastoDto) => gastoApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GASTO_QUERY_KEYS.lists() });
        },
    });
};

export const useUpdateGasto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateGastoDto }) => gastoApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: GASTO_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: GASTO_QUERY_KEYS.detail(variables.id) });
        },
    });
};

export const useDeleteGasto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => gastoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: GASTO_QUERY_KEYS.lists() });
        },
    });
};