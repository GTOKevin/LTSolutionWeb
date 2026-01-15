import { httpClient } from '@shared/api/http';
import type { PagedResponse,SelectItem } from '@/shared/model/types';
import type { TipoMaestro, CreateTipoMaestroDto, TipoMaestroParams } from '../model/maestro.types';

export const maestroApi = {
    getById: (id: number) => httpClient.get<TipoMaestro>(`/TipoMaestro/${id}`),

    getAll: (params: TipoMaestroParams) => 
        httpClient.get<PagedResponse<TipoMaestro>>('/TipoMaestro', { params }),

    getSelect: (search?: string, seccion?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/TipoMaestro/select', { params: { search, seccion, limit } }),    

    create: (data: CreateTipoMaestroDto) => httpClient.post<number>('/TipoMaestro', data),

    update: (id: number, data: CreateTipoMaestroDto) => httpClient.put<void>(`/TipoMaestro/${id}`, data),
};
