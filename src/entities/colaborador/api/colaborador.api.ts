import { httpClient } from '@shared/api/http';
import type { SelectItem,PagedResponse } from '@/shared/model/types';
import type { Colaborador, CreateColaboradorDto, ColaboradorParams } from '../model/types';

export const colaboradorApi = {
    getAll: async (params: ColaboradorParams) => {
        const { data } = await httpClient.get<PagedResponse<Colaborador>>('/Colaborador', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await httpClient.get<Colaborador>(`/Colaborador/${id}`);
        return data;
    },

    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Colaborador/select', { params: { search, limit } });
        return data;
    },

    getSelectAvailable: async (currentColaboradorId?: number) => {
        const { data } = await httpClient.get<SelectItem[]>('/Colaborador/select-available', { params: { currentColaboradorId } });
        return data;
    },

    create: (data: CreateColaboradorDto) => httpClient.post<number>('/Colaborador', data).then(res => res.data),

    update: (id: number, data: CreateColaboradorDto) => 
        httpClient.put<void>(`/Colaborador/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/${id}`)
};
