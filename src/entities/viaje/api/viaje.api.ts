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
        if (filters.clienteID) params.append('clienteID', filters.clienteID.toString());
        if (filters.colaboradorID) params.append('colaboradorID', filters.colaboradorID.toString());
        if (filters.estadoID) params.append('estadoID', filters.estadoID.toString());

        const response = await http.get<PagedViajes>(`/viaje?${params.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await http.get<Viaje>(`/viaje/${id}`);
        return response.data;
    },

    create: async (data: CreateViajeDto) => {
        const response = await http.post<number>('/viaje', data);
        return response.data;
    },

    update: async (id: number, data: UpdateViajeDto) => {
        await http.put(`/viaje/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viaje/${id}`);
    }
};
