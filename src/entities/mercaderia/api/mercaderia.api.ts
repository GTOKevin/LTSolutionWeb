import { httpClient } from '@/shared/api/http';
import type { Mercaderia, MercaderiaDto, CreateMercaderiaDto, MercaderiaParams } from '../model/types';
import type { PagedResponse, SelectItem } from '@/shared/model/types';

export const mercaderiaApi = {
    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Mercaderia/select', { params: { search, limit } });
        return data;
    },
    getAll: async (params: MercaderiaParams) => {
        const { data } = await httpClient.get<PagedResponse<Mercaderia>>('/Mercaderia', { params });
        return data;
    },
    getById: async (id: number) => {
        const { data } = await httpClient.get<MercaderiaDto>(`/Mercaderia/${id}`);
        return data;
    },
    create: (data: CreateMercaderiaDto) => httpClient.post<number>('/Mercaderia', data).then(res => res.data),
    update: (id: number, data: CreateMercaderiaDto) =>
        httpClient.put<void>(`/Mercaderia/${id}`, data),
    delete: (id: number) => httpClient.delete<void>(`/Mercaderia/${id}`)
};
