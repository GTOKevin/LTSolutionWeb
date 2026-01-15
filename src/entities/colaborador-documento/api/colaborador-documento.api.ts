import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type { ColaboradorDocumento, CreateColaboradorDocumentoDto, ColaboradorDocumentoParams } from '../model/types';

export const colaboradorDocumentoApi = {
    getAll: (params: ColaboradorDocumentoParams) => 
        httpClient.get<PagedResponse<ColaboradorDocumento>>('/Colaborador/documentos', { params }),

    getById: (id: number) => 
        httpClient.get<ColaboradorDocumento>(`/Colaborador/documentos/${id}`), // Note: Assuming this exists or using getAll

    create: (colaboradorId: number, data: CreateColaboradorDocumentoDto) => 
        httpClient.post<number>(`/Colaborador/${colaboradorId}/documentos`, data),

    update: (id: number, data: CreateColaboradorDocumentoDto) => 
        httpClient.put<void>(`/Colaborador/documentos/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/documentos/${id}`)
};
