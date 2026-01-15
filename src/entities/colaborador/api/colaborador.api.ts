import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@shared/api/types';
import type { Colaborador, CreateColaboradorDto, ColaboradorParams } from '../model/types';
import type { SelestListItem } from '@/shared/model/types';

export const colaboradorApi = {
    getAll: (params: ColaboradorParams) => 
        httpClient.get<PagedResponse<Colaborador>>('/Colaborador', { params }),

    getById: (id: number) => 
        httpClient.get<Colaborador>(`/Colaborador/${id}`),

    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelestListItem[]>('/Colaborador/select', { params: { search, limit } }),

    getSelectAvailable: (currentColaboradorId?: number) =>
        httpClient.get<SelestListItem[]>('/Colaborador/select-available', { params: { currentColaboradorId } }),

    create: (data: CreateColaboradorDto) => 
        httpClient.post<number>('/Colaborador', data),

    update: (id: number, data: CreateColaboradorDto) => 
        httpClient.put<void>(`/Colaborador/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/${id}`)
};
