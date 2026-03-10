import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeIncidenteDto, ViajeIncidente } from '../model/types';

export const viajeIncidenteApi = {
    getByViaje: async (viajeId: number) => {
        const response = await http.get<ViajeIncidente[]>(`/viajeincidente/byviaje/${viajeId}`);
        return response.data;
    },

    create: async (viajeId: number, data: CreateViajeIncidenteDto) => {
        // CreateViajeIncidenteCommand expects ViajeID and Incidente object
        const payload = {
            viajeID: viajeId,
            incidente: data
        };
        const response = await http.post<number>('/viajeincidente', payload);
        return response.data;
    },

    update: async (id: number, data: CreateViajeIncidenteDto) => {
        await http.put(`/viajeincidente/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajeincidente/${id}`);
    }
};
