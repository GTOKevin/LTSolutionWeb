import { httpClient } from '@/shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type { TipoMaestro } from '../model/types';

export const tipoMaestroApi = {
    getAll: (params?: { page?: number; size?: number; search?: string; seccion?: string }) =>
        httpClient.get<PagedResponse<TipoMaestro>>('/TipoMaestro', { params }),
    getById: (id: number) =>
        httpClient.get<TipoMaestro>(`/TipoMaestro/${id}`),
    create: (data: Omit<TipoMaestro, 'tipoMaestroID'>) =>
        httpClient.post<number>('/TipoMaestro', data),
    update: (id: number, data: Omit<TipoMaestro, 'tipoMaestroID'>) =>
        httpClient.put<void>(`/TipoMaestro/${id}`, data),
    getSecciones: () =>
        httpClient.get<string[]>('/TipoMaestro/secciones'),
};
