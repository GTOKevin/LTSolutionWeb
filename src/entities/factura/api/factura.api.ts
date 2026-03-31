import { httpClient as http } from '@/shared/api/http';
import type { 
    Factura, 
    FacturaFilters, 
    PagedFacturas, 
    CreateFacturaDto, 
    UpdateFacturaDto,
    CreateFacturaDetalleDto,
    CreateFacturaPagoDto
} from '../model/types';

export const facturaApi = {
    getAll: async (filters: FacturaFilters) => {
        const params = new URLSearchParams();
        params.append('page', filters.page.toString());
        params.append('size', filters.size.toString());
        
        if (filters.search) params.append('search', filters.search);

        const response = await http.get<PagedFacturas>(`/factura?${params.toString()}`);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await http.get<Factura>(`/factura/${id}`);
        return response.data;
    },

    create: (data: CreateFacturaDto) => http.post<number>('/factura', data).then(res => res.data),

    update: async (id: number, data: UpdateFacturaDto) => {
        await http.put(`/factura/${id}`, data);
    },

    delete: async (id: number) => {
        await http.delete(`/factura/${id}`);
    },

    addDetalle: async (facturaId: number, data: CreateFacturaDetalleDto) => {
        const response = await http.post<number>(`/factura/${facturaId}/detalles`, data);
        return response.data;
    },

    removeDetalle: async (detalleId: number) => {
        await http.delete(`/factura/detalles/${detalleId}`);
    },

    addPago: async (facturaId: number, data: CreateFacturaPagoDto) => {
        const response = await http.post<number>(`/factura/${facturaId}/pagos`, data);
        return response.data;
    },

    removePago: async (pagoId: number) => {
        await http.delete(`/factura/pagos/${pagoId}`);
    }
};
