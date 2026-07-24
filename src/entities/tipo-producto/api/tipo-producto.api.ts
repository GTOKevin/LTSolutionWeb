import { httpClient } from '@shared/api/http';
import type { SelectItem, SelectStringItem, PagedResponse } from '@/shared/model/types';
import type { TipoProducto, TipoProductoDto, CreateTipoProductoDto, TipoProductoParams } from '../model/types';

export const tipoProductoApi = {
    getAll: async (params: TipoProductoParams) => {
        const { data } = await httpClient.get<PagedResponse<TipoProducto>>('/TipoProducto', { params });
        return data;
    },
    getById: async (id: number) => {
        const { data } = await httpClient.get<TipoProductoDto>(`/TipoProducto/${id}`);
        return data;
    },
    create: (data: CreateTipoProductoDto) => httpClient.post<number>('/TipoProducto', data).then(res => res.data),
    update: (id: number, data: CreateTipoProductoDto) =>
        httpClient.put<void>(`/TipoProducto/${id}`, data),
    delete: (id: number) => httpClient.delete<void>(`/TipoProducto/${id}`),
    
    getSelect: async (search?: string, limit: number = 20, category?: string) => {
        const { data } = await httpClient.get<SelectItem[]>('/TipoProducto/select', { params: { search, limit, category } });
        return data;
    },
        
    getSelectCategoria: async () => {
        const { data } = await httpClient.get<SelectStringItem[]>('/TipoProducto/Categoria/select');
        return data;
    },
};
