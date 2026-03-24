import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tipoProductoApi } from '@/entities/tipo-producto/api/tipo-producto.api';
import type { CreateTipoProductoDto } from '@/entities/tipo-producto/model/types';

export const TIPO_PRODUCTO_QUERY_KEYS = {
    all: ['tipo-productos'] as const,
    lists: () => [...TIPO_PRODUCTO_QUERY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...TIPO_PRODUCTO_QUERY_KEYS.lists(), { filters }] as const,
    details: () => [...TIPO_PRODUCTO_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...TIPO_PRODUCTO_QUERY_KEYS.details(), id] as const,
};

export const useCreateTipoProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTipoProductoDto) => tipoProductoApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TIPO_PRODUCTO_QUERY_KEYS.lists() });
        },
    });
};

export const useUpdateTipoProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateTipoProductoDto }) => tipoProductoApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: TIPO_PRODUCTO_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: TIPO_PRODUCTO_QUERY_KEYS.detail(variables.id) });
        },
    });
};

export const useDeleteTipoProducto = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => tipoProductoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TIPO_PRODUCTO_QUERY_KEYS.lists() });
        },
    });
};