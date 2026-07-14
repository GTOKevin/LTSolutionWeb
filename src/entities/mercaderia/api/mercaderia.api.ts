import { httpClient } from '@/shared/api/http';
import type { Mercaderia, MercaderiaDto, CreateMercaderiaDto, MercaderiaParams } from '../model/types';
import type { PagedResponse, SelectItem } from '@/shared/model/types';

export const mercaderiaApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Mercaderia/select', { params: { search, limit } }),
    getAll: (params: MercaderiaParams) =>
        httpClient.get<PagedResponse<Mercaderia>>('/Mercaderia', { params }),
    getById: (id: number) =>
        httpClient.get<MercaderiaDto>(`/Mercaderia/${id}`),
    create: (data: CreateMercaderiaDto) => httpClient.post<number>('/Mercaderia', data).then(res => res.data),
    update: (id: number, data: CreateMercaderiaDto) =>
        httpClient.put<void>(`/Mercaderia/${id}`, data),
    delete: (id: number) => httpClient.delete<void>(`/Mercaderia/${id}`)
};
