import { httpClient as http } from '@/shared/api/http';
import type { CreateViajePermisoDto, PagedViajePermisos } from '../model/types';
import type { PagedFilters } from '@/shared/model/types';

export const viajePermisoApi = {
    getByViaje: async (viajeId: number, filters: PagedFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        const response = await http.get<PagedViajePermisos>(`/viajepermiso/byviaje/${viajeId}?${params.toString()}`);
        return response.data;
    },

    create: (viajeId: number, data: CreateViajePermisoDto) => {
        const payload = {
            viajeID: viajeId,
            permiso: data
        };
        return http.post<number>('/viajepermiso', payload).then(res => res.data);
    },

    update: async (id: number, data: CreateViajePermisoDto) => {
        await http.put(`/viajepermiso/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajepermiso/${id}`);
    }
};
