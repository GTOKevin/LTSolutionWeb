import { httpClient as http } from '@/shared/api/http';
import type { CreateViajePermisoDto, ViajePermiso } from '../model/types';

export const viajePermisoApi = {
    getByViaje: async (viajeId: number) => {
        const response = await http.get<ViajePermiso[]>(`/viajepermiso/byviaje/${viajeId}`);
        return response.data;
    },

    create: async (viajeId: number, data: CreateViajePermisoDto) => {
        const payload = {
            viajeID: viajeId,
            permiso: data
        };
        const response = await http.post<number>('/viajepermiso', payload);
        return response.data;
    },

    update: async (id: number, data: CreateViajePermisoDto) => {
        await http.put(`/viajepermiso/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajepermiso/${id}`);
    }
};
