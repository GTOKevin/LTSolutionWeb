import { httpClient } from '@/shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type { SelectItem } from '@/shared/model/types';
import type { TipoMaestro } from '../model/types';

export const tipoMaestroApi = {
    getAll: async (params?: { page?: number; size?: number; search?: string; seccion?: string }) => {
        const { data } = await httpClient.get<PagedResponse<TipoMaestro>>('/TipoMaestro', { params });
        return data;
    },
    getById: async (id: number) => {
        const { data } = await httpClient.get<TipoMaestro>(`/TipoMaestro/${id}`);
        return data;
    },
    getSelect: async (search?: string, seccion?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/TipoMaestro/select', { params: { search, seccion, limit } });
        return data;
    },
    create: (data: Omit<TipoMaestro, 'tipoMaestroID'>) =>
        httpClient.post<number>('/TipoMaestro', data).then(res => res.data),
    update: (id: number, data: Omit<TipoMaestro, 'tipoMaestroID'>) =>
        httpClient.put<void>(`/TipoMaestro/${id}`, data),
    delete: (id: number) =>
        httpClient.delete<void>(`/TipoMaestro/${id}`),
    getSecciones: async () => {
        const { data } = await httpClient.get<string[]>('/TipoMaestro/secciones');
        return data;
    },
};

export const maestroApi = tipoMaestroApi;
