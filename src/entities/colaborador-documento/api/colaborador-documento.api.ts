import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type {
    ColaboradorDocumento,
    CreateColaboradorDocumentoDto,
    ColaboradorDocumentoParams,
    ColaboradorDocumentoSolicitud,
    ColaboradorDocumentoSolicitudesParams,
    ReviewDocumentoActualizacionSolicitudDto,
} from '../model/types';

export const colaboradorDocumentoApi = {
    getAll: async (params: ColaboradorDocumentoParams) => {
        const { data } = await httpClient.get<PagedResponse<ColaboradorDocumento>>('/Colaborador/documentos', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await httpClient.get<ColaboradorDocumento>(`/Colaborador/documentos/${id}`);
        return data;
    },

    create: (colaboradorId: number, data: CreateColaboradorDocumentoDto) => 
        httpClient.post<number>(`/Colaborador/${colaboradorId}/documentos`, data).then(res => res.data),

    update: (id: number, data: CreateColaboradorDocumentoDto) => 
        httpClient.put<void>(`/Colaborador/documentos/${id}`, data),

    delete: (id: number) =>
        httpClient.delete<void>(`/Colaborador/documentos/${id}`),

    getSolicitudes: async (params: ColaboradorDocumentoSolicitudesParams) => {
        const { data } = await httpClient.get<PagedResponse<ColaboradorDocumentoSolicitud>>('/Colaborador/documentos/solicitudes', { params });
        return data;
    },

    approveSolicitud: (id: number, payload: ReviewDocumentoActualizacionSolicitudDto) =>
        httpClient.put<void>(`/Colaborador/documentos/solicitudes/${id}/approve`, payload),

    rejectSolicitud: (id: number, payload: ReviewDocumentoActualizacionSolicitudDto) =>
        httpClient.put<void>(`/Colaborador/documentos/solicitudes/${id}/reject`, payload),
};
