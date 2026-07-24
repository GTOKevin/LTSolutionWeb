import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type { Licencia, CreateLicenciaDto, LicenciaParams, ColaboradorLicenciasReportDto } from '../model/types';

export const licenciaApi = {
    getAll: async (params: LicenciaParams) => {
        const { data } = await httpClient.get<PagedResponse<Licencia>>('/Colaborador/licencias', { params });
        return data;
    },

    getReportData: (id: number, params?: LicenciaParams) =>
        httpClient.get<ColaboradorLicenciasReportDto>(`/Colaborador/${id}/licencias/reporte`, { params }).then(res => res.data),

    getById: async (id: number) => {
        const { data } = await httpClient.get<Licencia>(`/Colaborador/licencias/${id}`);
        return data;
    },

    create: (colaboradorId: number, data: CreateLicenciaDto) => 
        httpClient.post<number>(`/Colaborador/${colaboradorId}/licencias`, data).then(res => res.data),

    update: (id: number, data: CreateLicenciaDto) => 
        httpClient.put<void>(`/Colaborador/licencias/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/licencias/${id}`)
};
