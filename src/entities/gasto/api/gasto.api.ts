import { httpClient } from '@/shared/api/http';
import type { Gasto, GastoDto, CreateGastoDto, GastoParams } from '../model/types';
import type { PagedResponse } from '@/shared/model/types';

export const gastoApi = {
    getAll: (params: GastoParams) =>
        httpClient.get<PagedResponse<Gasto>>('/Gasto', { params }),
    getById: (id: number) =>
        httpClient.get<GastoDto>(`/Gasto/${id}`),
    create: (data: CreateGastoDto) => httpClient.post<number>('/Gasto', data).then(res => res.data),
    update: (id: number, data: CreateGastoDto) =>
        httpClient.put<void>(`/Gasto/${id}`, data)
};
