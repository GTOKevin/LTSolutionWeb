import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeDto, PagedViajes, UpdateViajeDto, Viaje, ViajeFilters } from '../model/types';

export const viajeApi = {
    getAll: async (filters: ViajeFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        
        if (filters.search) params.append('search', filters.search);
        if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
        if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
        if (filters.clienteID) params.append('clienteId', filters.clienteID.toString());
        if (filters.colaboradorID) params.append('colaboradorId', filters.colaboradorID.toString());
        if (filters.tractoID) params.append('tractoId', filters.tractoID.toString());
        if (filters.carretaID) params.append('carretaId', filters.carretaID.toString());
        if (filters.estadoID) params.append('estadoId', filters.estadoID.toString());

        const response = await http.get<PagedViajes>(`/viaje?${params.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await http.get<Viaje>(`/viaje/${id}`);
        return response.data;
    },

    create: (data: CreateViajeDto) => http.post<number>('/viaje', data).then(res => res.data),

    update: async (id: number, data: UpdateViajeDto) => {
        const response = await http.put(`/viaje/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await http.delete(`/viaje/${id}`);
    },

    getGeneralExcelReport: async (id: number) => {
        const response = await http.get(`/viaje/${id}/report/excel`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getGeneralPdfReport: async (id: number) => {
        const response = await http.get(`/viaje/${id}/report/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    getGeneralReportData: async (id: number) => {
        const response = await http.get<import('../model/types').ViajeGeneralReportDto>(`/viaje/${id}/report/data`);
        return response.data;
    },

    getReportList: async (filters: { 
        fechaInicio: string; 
        fechaFin: string;
        clienteID?: number;
        colaboradorID?: number;
        tractoID?: number;
        carretaID?: number;
        search?: string;
    }) => {
        const params = new URLSearchParams();
        params.append('fechaInicio', filters.fechaInicio);
        params.append('fechaFin', filters.fechaFin);
        if (filters.clienteID) params.append('clienteId', filters.clienteID.toString());
        if (filters.colaboradorID) params.append('colaboradorId', filters.colaboradorID.toString());
        if (filters.tractoID) params.append('tractoId', filters.tractoID.toString());
        if (filters.carretaID) params.append('carretaId', filters.carretaID.toString());
        if (filters.search) params.append('search', filters.search);

        const response = await http.get<import('../model/types').ViajeListReportDto[]>(`/viaje/report/list?${params.toString()}`);
        return response.data;
    },

    reopen: async (id: number) => {
        await http.post(`/viaje/${id}/reabrir`);
    }
};
