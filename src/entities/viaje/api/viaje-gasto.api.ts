import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeGastoDto, ViajeGasto } from '../model/types';

export const viajeGastoApi = {
    getByViaje: async (viajeId: number) => {
        const response = await http.get<ViajeGasto[]>(`/viajegasto/byviaje/${viajeId}`);
        return response.data;
    },

    create: async (viajeId: number, data: CreateViajeGastoDto) => {
        const payload = {
            viajeID: viajeId,
            gasto: data
        };
        const response = await http.post<number>('/viajegasto', payload);
        return response.data;
    },

    update: async (id: number, data: CreateViajeGastoDto) => {
        await http.put(`/viajegasto/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajegasto/${id}`);
    }
};
