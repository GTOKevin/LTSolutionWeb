import { httpClient } from '@/shared/api/http';
import type { Gasto, GastoDto, CreateGastoDto, GastoParams } from '../model/types';
import type { PagedResponse, SelectItem } from '@/shared/model/types';

export const gastoApi = {
    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Gasto/select', { params: { search, limit } });
        return data;
    },
    getAll: async (params: GastoParams) => {
        const { data } = await httpClient.get<PagedResponse<Gasto>>('/Gasto', { params });
        return data;
    },
    getById: async (id: number) => {
        const { data } = await httpClient.get<GastoDto>(`/Gasto/${id}`);
        return data;
    },
    create: (data: CreateGastoDto) => httpClient.post<number>('/Gasto', data).then(res => res.data),
    update: (id: number, data: CreateGastoDto) =>
        httpClient.put<void>(`/Gasto/${id}`, data),
    delete: (id: number) => httpClient.delete<void>(`/Gasto/${id}`)
};
