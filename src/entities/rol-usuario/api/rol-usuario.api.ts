import { httpClient } from '@shared/api/http';
import type { SelectItem,PagedResponse } from '@/shared/model/types';
import type { RolUsuario } from '../model/types';

export const rolUsuarioApi = {
    getAll: (params?: { page?: number; size?: number; search?: string }) =>
        httpClient.get<PagedResponse<RolUsuario>>('/RolUsuario', { params }),

    getById: (id: number) =>
        httpClient.get<RolUsuario>(`/RolUsuario/${id}`),

    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/RolUsuario/select', { params: { search, limit } }),

    create: (data: Omit<RolUsuario, 'rolUsuarioID'>) =>
        httpClient.post<number>('/RolUsuario', data),

    update: (id: number, data: Omit<RolUsuario, 'rolUsuarioID'>) =>
        httpClient.put<void>(`/RolUsuario/${id}`, data),

    delete: (id: number) =>
        httpClient.delete<void>(`/RolUsuario/${id}`),
};
