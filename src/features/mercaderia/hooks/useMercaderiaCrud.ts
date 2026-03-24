import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mercaderiaApi } from '@/entities/mercaderia/api/mercaderia.api';
import type { CreateMercaderiaDto } from '@/entities/mercaderia/model/types';

export const MERCADERIA_QUERY_KEYS = {
    all: ['mercaderias'] as const,
    lists: () => [...MERCADERIA_QUERY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...MERCADERIA_QUERY_KEYS.lists(), { filters }] as const,
    details: () => [...MERCADERIA_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...MERCADERIA_QUERY_KEYS.details(), id] as const,
};

export const useCreateMercaderia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMercaderiaDto) => mercaderiaApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MERCADERIA_QUERY_KEYS.lists() });
        },
    });
};

export const useUpdateMercaderia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateMercaderiaDto }) => mercaderiaApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: MERCADERIA_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: MERCADERIA_QUERY_KEYS.detail(variables.id) });
        },
    });
};

export const useDeleteMercaderia = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => mercaderiaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MERCADERIA_QUERY_KEYS.lists() });
        },
    });
};