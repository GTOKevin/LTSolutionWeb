import { httpClient as http } from '@/shared/api/http';
import type { 
    ViajeRutaDto, 
    CreateViajeRutaDto, 
    UpdateViajeRutaDto, 
    ReorderViajeRutasDto,
    ViajeReferenciaRutaDto
} from '../model/types';

export const viajeRutaApi = {
    getByViajeId: async (viajeId: number) => {
        const response = await http.get<ViajeRutaDto[]>(`/viaje/${viajeId}/rutas`);
        return response.data;
    },

    getSugerencias: async (viajeId: number) => {
        const response = await http.get<ViajeReferenciaRutaDto[]>(`/viaje/${viajeId}/rutas/sugerencias`);
        return response.data;
    },

    clonarRuta: async (viajeId: number, viajeIdReferencia: number) => {
        await http.post(`/viaje/${viajeId}/rutas/clonar/${viajeIdReferencia}`);
    },

    create: async (viajeId: number, data: CreateViajeRutaDto) => {
        const response = await http.post<number>(`/viaje/${viajeId}/rutas`, data);
        return response.data;
    },

    update: async (viajeId: number, id: number, data: UpdateViajeRutaDto) => {
        const response = await http.put(`/viaje/${viajeId}/rutas/${id}`, data);
        return response.data;
    },

    delete: async (viajeId: number, id: number) => {
        await http.delete(`/viaje/${viajeId}/rutas/${id}`);
    },

    reorder: async (viajeId: number, data: ReorderViajeRutasDto) => {
        await http.put(`/viaje/${viajeId}/rutas/reorder`, data);
    }
};