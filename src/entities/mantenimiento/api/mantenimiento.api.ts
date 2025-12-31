import { httpClient as http } from '../../../shared/api/http';
import type { PagedResponse } from '../../../shared/api/types';
import type { 
    CreateMantenimientoDetalleDto, 
    CreateMantenimientoDto, 
    Mantenimiento, 
    MantenimientoDetalleParams, 
    MantenimientoDetalleResponse,
    MantenimientoParams,
    MantenimientoReport
} from '../model/types';

export const mantenimientoApi = {
    getAll: async (params: MantenimientoParams) => {
        const { data } = await http.get<PagedResponse<Mantenimiento>>('/mantenimiento', { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await http.get<Mantenimiento>(`/mantenimiento/${id}`);
        return data;
    },

    create: async (dto: CreateMantenimientoDto) => {
        const { data } = await http.post<number>('/mantenimiento', dto);
        return data;
    },

    update: async (id: number, dto: CreateMantenimientoDto) => {
        await http.put(`/mantenimiento/${id}`, dto);
    },

    delete: async (id: number) => {
        await http.delete(`/mantenimiento/${id}`);
    },

    // Detalles
    getDetalles: async (params: MantenimientoDetalleParams) => {
        const { data } = await http.get<MantenimientoDetalleResponse>('/mantenimiento/detalles', { params });
        return data;
    },

    addDetalle: async (mantenimientoId: number, dto: CreateMantenimientoDetalleDto) => {
        const { data } = await http.post<number>(`/mantenimiento/${mantenimientoId}/detalles`, dto);
        return data;
    },

    updateDetalle: async (id: number, dto: CreateMantenimientoDetalleDto) => {
        await http.put(`/mantenimiento/detalles/${id}`, dto);
    },

    removeDetalle: async (id: number) => {
        await http.delete(`/mantenimiento/detalles/${id}`);
    },

    // Reporte
    getReport: async (id: number) => {
        const { data } = await http.get<MantenimientoReport>(`/mantenimiento/${id}/reporte`);
        return data;
    }
};
