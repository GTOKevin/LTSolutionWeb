import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeGuiaDto, ViajeGuia } from '../model/types';

export const viajeGuiaApi = {
    getByViaje: async (viajeId: number) => {
        const response = await http.get<ViajeGuia[]>(`/viajeguia/byviaje/${viajeId}`);
        return response.data;
    },

    create: async (viajeId: number, data: CreateViajeGuiaDto) => {
        const payload = {
            viajeID: viajeId,
            guia: data
        };
        const response = await http.post<number>('/viajeguia', payload);
        return response.data;
    },

    update: async (id: number, data: CreateViajeGuiaDto) => {
        await http.put(`/viajeguia/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajeguia/${id}`);
    }
};
