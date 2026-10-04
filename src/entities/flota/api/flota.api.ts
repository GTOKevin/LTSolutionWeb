import { httpClient } from '@shared/api/http';
import type { PagedResponse, SelectItem } from '@/shared/model/types';
import type {
    Flota,
    FlotaDocumento,
    CreateFlotaDto,
    CreateFlotaDocumentoDto,
    FlotaParams,
    FlotaDocumentoParams,
    FlotaParamsSelect,
    FlotaResumen,
    FlotaExpediente,
    FlotaHistorialViajesPaged,
    FlotaHistorialViajesParams,
} from '../model/types';

export type FlotaReportFormat = 'excel' | 'pdf';

export const flotaApi = {
    getById: async (id: number) => {
        const { data } = await httpClient.get<Flota>(`/Flota/${id}`);
        return data;
    },

    getAll: async (params: FlotaParams) => {
        const { data } = await httpClient.get<PagedResponse<Flota>>('/Flota', { params });
        return data;
    },

    getResumen: async () => {
        const { data } = await httpClient.get<FlotaResumen>('/Flota/resumen');
        return data;
    },

    getExpediente: async (id: number) => {
        const { data } = await httpClient.get<FlotaExpediente>(`/Flota/${id}/expediente`);
        return data;
    },

    getHistorialViajes: async (id: number, params: FlotaHistorialViajesParams) => {
        const { data } = await httpClient.get<FlotaHistorialViajesPaged>(`/Flota/${id}/historial-viajes`, { params });
        return data;
    },

    getSelect: async (params?: FlotaParamsSelect | string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Flota/select', {
            params: typeof params === 'string'
                ? { search: params, limit }
                : params,
        });
        return data;
    },
    getSelectTipo: async (tipo?: string, limit: number = 20, search?: string) => {
        const { data } = await httpClient.get<SelectItem[]>('/Flota/tipo-select', { params: { tipo, limit, search } });
        return data;
    },
    getDisponibilidad: async () => {
        const { data } = await httpClient.get<{ totalTractos: number; tractosLibres: number; porcentajeActiva: number }>('/Flota/disponibilidad');
        return data;
    },

    getDocumentos: async (params: FlotaDocumentoParams) => {
        const { data } = await httpClient.get<PagedResponse<FlotaDocumento>>('/Flota/documentos', { params });
        return data;
    },

    create: (data: CreateFlotaDto) => httpClient.post<number>('/Flota', data).then(res => res.data),

    update: (id: number, data: CreateFlotaDto) => httpClient.put<void>(`/Flota/${id}`, data),

    delete: (id: number) => httpClient.delete<void>(`/Flota/${id}`),

    addDocumento: (flotaId: number, data: CreateFlotaDocumentoDto) => 
        httpClient.post<number>(`/Flota/${flotaId}/documentos`, data).then(res => res.data),

    updateDocumento: (documentoId: number, data: CreateFlotaDocumentoDto) => 
        httpClient.put<void>(`/Flota/documentos/${documentoId}`, data),

    removeDocumento: (documentoId: number) => httpClient.delete<void>(`/Flota/documentos/${documentoId}`),

    /** Descarga el reporte de inventario (Excel/PDF) generado por el backend. */
    downloadReporteInventario: async (format: FlotaReportFormat, params?: FlotaParams) => {
        const { data } = await httpClient.get<Blob>(`/Flota/reporte/inventario/${format}`, {
            params,
            responseType: 'blob',
        });
        return data;
    },

    /** Descarga la ficha técnica PDF de una unidad generada por el backend. */
    downloadFichaPdf: async (id: number) => {
        const { data } = await httpClient.get<Blob>(`/Flota/${id}/reporte/pdf`, {
            responseType: 'blob',
        });
        return data;
    },
};
