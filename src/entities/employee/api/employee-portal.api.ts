import { httpClient } from '@shared/api/http';
import type {
    CreateDocumentoActualizacionSolicitudDto,
    CreateMiLicenciaRequestDto,
    MiDocumentoFilters,
    MiDocumentoSolicitudesFilters,
    MiDocumentosResponse,
    MiLicenciaFilters,
    MiLicenciasResponse,
    MiPagoFilters,
    MiPagosResponse,
    MiViajeFilters,
    MiViajesResponse,
    MiViajeDetailDto,
    UpdateMiViajeKmsDto,
    MiDocumentoSolicitudesResponse,
} from '../model/types';

export const EMPLOYEE_PORTAL_QUERY_KEYS = {
    all: ['employee-portal'] as const,
    viajes: (filters: MiViajeFilters) => [...EMPLOYEE_PORTAL_QUERY_KEYS.all, 'viajes', filters] as const,
    viajeDetail: (id: number) => [...EMPLOYEE_PORTAL_QUERY_KEYS.all, 'viaje', id] as const,
    pagos: (filters: MiPagoFilters) => [...EMPLOYEE_PORTAL_QUERY_KEYS.all, 'pagos', filters] as const,
    licencias: (filters: MiLicenciaFilters) => [...EMPLOYEE_PORTAL_QUERY_KEYS.all, 'licencias', filters] as const,
    documentos: (filters: MiDocumentoFilters) => [...EMPLOYEE_PORTAL_QUERY_KEYS.all, 'documentos', filters] as const,
    solicitudes: (filters: MiDocumentoSolicitudesFilters) =>
        [...EMPLOYEE_PORTAL_QUERY_KEYS.all, 'solicitudes-documentos', filters] as const,
};

export const employeePortalApi = {
    getMyViajes: async (params: MiViajeFilters) => {
        const { data } = await httpClient.get<MiViajesResponse>('/employee/trips', { params });
        return data;
    },

    getMyViajeById: async (id: number) => {
        const { data } = await httpClient.get<MiViajeDetailDto>(`/employee/trips/${id}`);
        return data;
    },

    updateMyViajeKms: async (id: number, payload: UpdateMiViajeKmsDto) => {
        await httpClient.put(`/employee/trips/${id}/kms`, payload);
    },

    getMyPagos: async (params: MiPagoFilters) => {
        const { data } = await httpClient.get<MiPagosResponse>('/employee/payments', { params });
        return data;
    },

    confirmMyPago: async (id: number) => {
        await httpClient.put(`/employee/payments/${id}/confirm`);
    },

    getMyLicencias: async (params: MiLicenciaFilters) => {
        const { data } = await httpClient.get<MiLicenciasResponse>('/employee/licenses', { params });
        return data;
    },

    createMyLicencia: async (payload: CreateMiLicenciaRequestDto) => {
        const { data } = await httpClient.post<number>('/employee/licenses', payload);
        return data;
    },

    getMyDocumentos: async (params: MiDocumentoFilters) => {
        const { data } = await httpClient.get<MiDocumentosResponse>('/employee/documents', { params });
        return data;
    },

    getMyDocumentoSolicitudes: async (params: MiDocumentoSolicitudesFilters) => {
        const { data } = await httpClient.get<MiDocumentoSolicitudesResponse>('/employee/documents/requests', { params });
        return data;
    },

    createDocumentoSolicitud: async (payload: CreateDocumentoActualizacionSolicitudDto) => {
        const { data } = await httpClient.post<number>('/employee/documents/requests', payload);
        return data;
    },
};
