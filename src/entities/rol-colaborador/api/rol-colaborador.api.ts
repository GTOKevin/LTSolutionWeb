import { httpClient } from '@shared/api/http';
import type { SelectItem, PagedResponse } from '@/shared/model/types';
import type { RolColaborador } from '../model/types';

export const rolColaboradorApi = {
    getAll: async (params?: { page?: number; size?: number; search?: string }) => {
        const { data } = await httpClient.get<PagedResponse<RolColaborador>>('/RolColaborador', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await httpClient.get<RolColaborador>(`/RolColaborador/${id}`);
        return data;
    },

    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/RolColaborador/select', { params: { search, limit } });
        return data;
    },

    create: (data: Omit<RolColaborador, 'rolColaboradorID'>) =>
        httpClient.post<number>('/RolColaborador', data).then(res => res.data),

    update: (id: number, data: Omit<RolColaborador, 'rolColaboradorID'>) =>
        httpClient.put<void>(`/RolColaborador/${id}`, data),

    delete: (id: number) =>
        httpClient.delete<void>(`/RolColaborador/${id}`),
};
