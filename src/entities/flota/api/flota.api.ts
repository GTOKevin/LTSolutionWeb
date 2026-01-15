import { httpClient } from '@shared/api/http';
import type { PagedResponse, SelectItem } from '@/shared/model/types';
import type { 
    Flota, 
    FlotaDocumento, 
    CreateFlotaDto, 
    CreateFlotaDocumentoDto, 
    FlotaParams, 
    FlotaDocumentoParams 
} from '../model/types';

export const flotaApi = {
    getById: (id: number) => httpClient.get<Flota>(`/Flota/${id}`),

    getAll: (params: FlotaParams) => 
        httpClient.get<PagedResponse<Flota>>('/Flota', { params }),

    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Flota/select', { params: { search, limit } }),

    getDocumentos: (params: FlotaDocumentoParams) =>
        httpClient.get<PagedResponse<FlotaDocumento>>('/Flota/documentos', { params }),

    create: (data: CreateFlotaDto) => httpClient.post<number>('/Flota', data),

    update: (id: number, data: CreateFlotaDto) => httpClient.put<void>(`/Flota/${id}`, data),

    delete: (id: number) => httpClient.delete<void>(`/Flota/${id}`),

    addDocumento: (flotaId: number, data: CreateFlotaDocumentoDto) => 
        httpClient.post<number>(`/Flota/${flotaId}/documentos`, data),

    updateDocumento: (documentoId: number, data: CreateFlotaDocumentoDto) => 
        httpClient.put<void>(`/Flota/documentos/${documentoId}`, data),

    removeDocumento: (documentoId: number) => httpClient.delete<void>(`/Flota/documentos/${documentoId}`),
};
