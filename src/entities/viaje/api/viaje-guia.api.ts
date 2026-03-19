import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeGuiaDto, PagedViajeGuias } from '../model/types';
import type { PagedFilters } from '@/shared/model/types';

export const viajeGuiaApi = {
    getByViaje: async (viajeId: number, filters: PagedFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        const response = await http.get<PagedViajeGuias>(`/viajeguia/byviaje/${viajeId}?${params.toString()}`);
        return response.data;
    },

    create: (viajeId: number, data: CreateViajeGuiaDto) => {
        const payload = {
            viajeID: viajeId,
            guia: data
        };
        return http.post<number>('/viajeguia', payload).then(res => res.data);
    },

    update: async (id: number, data: CreateViajeGuiaDto) => {
        await http.put(`/viajeguia/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajeguia/${id}`);
    }
};
