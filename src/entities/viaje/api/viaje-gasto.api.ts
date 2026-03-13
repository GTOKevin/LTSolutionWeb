import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeGastoDto, PagedViajeGastos } from '../model/types';
import type { PagedFilters } from '@/shared/model/types';

export const viajeGastoApi = {
    getByViaje: async (viajeId: number, filters: PagedFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        const response = await http.get<PagedViajeGastos>(`/viajegasto/byviaje/${viajeId}?${params.toString()}`);
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
