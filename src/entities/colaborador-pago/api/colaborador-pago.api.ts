import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type { ColaboradorPago, CreateColaboradorPagoDto, ColaboradorPagoParams, ColaboradorPagosReportDto } from '../model/types';

export const colaboradorPagoApi = {
    getAll: (params: ColaboradorPagoParams) => 
        httpClient.get<PagedResponse<ColaboradorPago>>('/Colaborador/pagos', { params }),

    getReportData: (id: number, params?: ColaboradorPagoParams) =>
        httpClient.get<ColaboradorPagosReportDto>(`/Colaborador/${id}/pagos/reporte`, { params }).then(res => res.data),

    create: (colaboradorId: number, data: CreateColaboradorPagoDto) => 
        httpClient.post<number>(`/Colaborador/${colaboradorId}/pagos`, data).then(res => res.data),

    update: (id: number, data: CreateColaboradorPagoDto) => 
        httpClient.put<void>(`/Colaborador/pagos/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/pagos/${id}`)
};
