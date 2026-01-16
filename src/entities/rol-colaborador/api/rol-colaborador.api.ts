import { httpClient } from '@shared/api/http';
import type { SelectItem, PagedResponse } from '@/shared/model/types';
import type { RolColaborador } from '../model/types';

export const rolColaboradorApi = {
    getAll: (params?: { page?: number; size?: number; search?: string }) =>
        httpClient.get<PagedResponse<RolColaborador>>('/RolColaborador', { params }),

    getById: (id: number) =>
        httpClient.get<RolColaborador>(`/RolColaborador/${id}`),

    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/RolColaborador/select', { params: { search, limit } }),

    create: (data: Omit<RolColaborador, 'rolColaboradorID'>) =>
        httpClient.post<number>('/RolColaborador', data),

    update: (id: number, data: Omit<RolColaborador, 'rolColaboradorID'>) =>
        httpClient.put<void>(`/RolColaborador/${id}`, data),
};
