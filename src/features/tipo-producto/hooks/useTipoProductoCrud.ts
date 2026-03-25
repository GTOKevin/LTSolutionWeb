import { createGenericCrudHooks } from '@/shared/hooks/useGenericCrud';
import { tipoProductoApi } from '@/entities/tipo-producto/api/tipo-producto.api';
import type { CreateTipoProductoDto } from '@/entities/tipo-producto/model/types';

export const TIPO_PRODUCTO_QUERY_KEYS = {
    all: ['tipo-productos'] as const,
    lists: () => [...TIPO_PRODUCTO_QUERY_KEYS.all, 'list'] as const,
    list: (filters: string) => [...TIPO_PRODUCTO_QUERY_KEYS.lists(), { filters }] as const,
    details: () => [...TIPO_PRODUCTO_QUERY_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...TIPO_PRODUCTO_QUERY_KEYS.details(), id] as const,
};

const genericApi = {
    create: (data: CreateTipoProductoDto) => tipoProductoApi.create(data),
    update: (args: { id: number; data: CreateTipoProductoDto }) => tipoProductoApi.update(args.id, args.data),
    delete: (id: number) => tipoProductoApi.delete(id)
};

export const {
    useCreate: useCreateTipoProducto,
    useUpdate: useUpdateTipoProducto,
    useDelete: useDeleteTipoProducto
} = createGenericCrudHooks(
    genericApi,
    'TipoProducto',
    (args) => {
        const keys: (readonly unknown[])[] = [TIPO_PRODUCTO_QUERY_KEYS.lists()];
        if (args && typeof args === 'object' && 'id' in args) {
            keys.push(TIPO_PRODUCTO_QUERY_KEYS.detail(args.id as number));
        }
        return keys;
    }
);