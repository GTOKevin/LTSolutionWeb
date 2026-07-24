import { httpClient } from '@shared/api/http';
import type { SelectItem,PagedResponse } from '@/shared/model/types';
import type { RolUsuario } from '../model/types';

export const rolUsuarioApi = {
    getAll: async (params?: { page?: number; size?: number; search?: string }) => {
        const { data } = await httpClient.get<PagedResponse<RolUsuario>>('/RolUsuario', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await httpClient.get<RolUsuario>(`/RolUsuario/${id}`);
        return data;
    },

    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/RolUsuario/select', { params: { search, limit } });
        return data;
    },

    create: (data: Omit<RolUsuario, 'rolUsuarioID'>) =>
        httpClient.post<number>('/RolUsuario', data).then(res => res.data),

    update: (id: number, data: Omit<RolUsuario, 'rolUsuarioID'>) =>
        httpClient.put<void>(`/RolUsuario/${id}`, data),

    delete: (id: number) =>
        httpClient.delete<void>(`/RolUsuario/${id}`),
};
