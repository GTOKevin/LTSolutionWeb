import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeEscoltaDto, ViajeEscolta } from '../model/types';

export const viajeEscoltaApi = {
    getByViaje: async (viajeId: number) => {
        const response = await http.get<ViajeEscolta[]>(`/viajeescolta/byviaje/${viajeId}`);
        return response.data;
    },

    create: async (viajeId: number, data: CreateViajeEscoltaDto) => {
        const payload = {
            viajeID: viajeId,
            escolta: data
        };
        const response = await http.post<number>('/viajeescolta', payload);
        return response.data;
    },

    update: async (id: number, data: CreateViajeEscoltaDto) => {
        await http.put(`/viajeescolta/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajeescolta/${id}`);
    }
};
