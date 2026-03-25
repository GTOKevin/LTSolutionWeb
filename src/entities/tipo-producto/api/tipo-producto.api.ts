import { httpClient } from '@shared/api/http';
import type { SelectItem, SelectStringItem, PagedResponse } from '@/shared/model/types';
import type { TipoProducto, TipoProductoDto, CreateTipoProductoDto, TipoProductoParams } from '../model/types';

export const tipoProductoApi = {
    getAll: (params: TipoProductoParams) =>
        httpClient.get<PagedResponse<TipoProducto>>('/TipoProducto', { params }),
    getById: (id: number) =>
        httpClient.get<TipoProductoDto>(`/TipoProducto/${id}`),
    create: (data: CreateTipoProductoDto) => httpClient.post<number>('/TipoProducto', data).then(res => res.data),
    update: (id: number, data: CreateTipoProductoDto) =>
        httpClient.put<void>(`/TipoProducto/${id}`, data),
    delete: (id: number) => httpClient.delete<void>(`/TipoProducto/${id}`),
    
    getSelect: (search?: string, limit: number = 20, category?: string) =>
        httpClient.get<SelectItem[]>('/TipoProducto/select', { params: { search, limit, category } }),
        
    getSelectCategoria: () =>
        httpClient.get<SelectStringItem[]>('/TipoProducto/Categoria/select'),
};
