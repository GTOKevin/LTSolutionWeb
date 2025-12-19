import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@shared/api/types';
import type { TipoMaestro, CreateTipoMaestroDto, TipoMaestroParams } from '../model/types';
import type { SelestListItem } from '@/shared/model/types';

export const maestroApi = {
    getById: (id: number) => httpClient.get<TipoMaestro>(`/TipoMaestro/${id}`),

    getAll: (params: TipoMaestroParams) => 
        httpClient.get<PagedResponse<TipoMaestro>>('/TipoMaestro', { params }),

    getSelect: (search?: string, seccion?: string, limit: number = 20) =>
        httpClient.get<SelestListItem[]>('/TipoMaestro/select', { params: { search, seccion, limit } }),

    create: (data: CreateTipoMaestroDto) => httpClient.post<number>('/TipoMaestro', data),

    update: (id: number, data: CreateTipoMaestroDto) => httpClient.put<void>(`/TipoMaestro/${id}`, data),
};
