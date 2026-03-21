import { httpClient as http } from '@/shared/api/http';
import type { CreateViajeEscoltaDto, PagedViajeEscoltas } from '../model/types';
import type { PagedFilters } from '@/shared/model/types';

export const viajeEscoltaApi = {
    getByViaje: async (viajeId: number, filters: PagedFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        const response = await http.get<PagedViajeEscoltas>(`/viajeescolta/byviaje/${viajeId}?${params.toString()}`);
        return response.data;
    },

    create: (viajeId: number, data: CreateViajeEscoltaDto) => {
        const payload = {
            viajeID: viajeId,
            escolta: data
        };
        return http.post<number>('/viajeescolta', payload).then(res => res.data);
    },

    update: async (id: number, data: CreateViajeEscoltaDto) => {
        await http.put(`/viajeescolta/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/viajeescolta/${id}`);
    }
};
