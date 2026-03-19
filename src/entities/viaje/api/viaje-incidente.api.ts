import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeIncidenteDto, PagedViajeIncidentes, ViajeIncidenteReportDto } from '../model/types';
import type { PagedFilters } from '@/shared/model/types';

export const viajeIncidenteApi = {
    getByViaje: async (viajeId: number, filters: PagedFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        const response = await http.get<PagedViajeIncidentes>(`/viajeincidente/byviaje/${viajeId}?${params.toString()}`);
        return response.data;
    },

    getReportData: async (viajeId: number) => {
        const response = await http.get<ViajeIncidenteReportDto>(`/viajeincidente/report/${viajeId}`);
        return response.data;
    },

    create: (viajeId: number, data: CreateViajeIncidenteDto) => {
        // CreateViajeIncidenteCommand expects ViajeID and Incidente object
        const payload = {
            viajeID: viajeId,
            incidente: data
        };
        return http.post<number>('/viajeincidente', payload).then(res => res.data);
    },

    update: async (id: number, data: CreateViajeIncidenteDto) => {
        await http.put(`/viajeincidente/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajeincidente/${id}`);
    }
};
