import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeMercaderiaDto, ViajeMercaderia } from '../model/types';

export const viajeMercaderiaApi = {
    getByViaje: async (viajeId: number) => {
        const response = await http.get<ViajeMercaderia[]>(`/viajemercaderia/byviaje/${viajeId}`);
        return response.data;
    },

    create: async (viajeId: number, data: CreateViajeMercaderiaDto) => {
        const payload = {
            viajeID: viajeId,
            mercaderia: data
        };
        const response = await http.post<number>('/viajemercaderia', payload);
        return response.data;
    },

    update: async (id: number, data: CreateViajeMercaderiaDto) => {
        await http.put(`/viajemercaderia/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajemercaderia/${id}`);
    }
};
