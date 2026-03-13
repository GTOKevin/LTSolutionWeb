import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeMercaderiaDto, PagedViajeMercaderias } from '../model/types';
import type { PagedFilters } from '@/shared/model/types';

export const viajeMercaderiaApi = {
    getByViaje: async (viajeId: number, filters: PagedFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        const response = await http.get<PagedViajeMercaderias>(`/viajemercaderia/byviaje/${viajeId}?${params.toString()}`);
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
