import { httpClient } from '@/shared/api/http';
import type { Mercaderia, MercaderiaDto, CreateMercaderiaDto, MercaderiaParams } from '../model/types';
import type { PagedResponse } from '@/shared/model/types';

export const mercaderiaApi = {
    getAll: (params: MercaderiaParams) =>
        httpClient.get<PagedResponse<Mercaderia>>('/Mercaderia', { params }),
    getById: (id: number) =>
        httpClient.get<MercaderiaDto>(`/Mercaderia/${id}`),
    create: (data: CreateMercaderiaDto) =>
        httpClient.post<number>('/Mercaderia', data),
    update: (id: number, data: CreateMercaderiaDto) =>
        httpClient.put<void>(`/Mercaderia/${id}`, data)
};
