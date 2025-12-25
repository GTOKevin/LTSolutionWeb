import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@shared/api/types';
import type { ColaboradorPago, CreateColaboradorPagoDto, ColaboradorPagoParams } from '../model/types';

export const colaboradorPagoApi = {
    getAll: (params: ColaboradorPagoParams) => 
        httpClient.get<PagedResponse<ColaboradorPago>>('/Colaborador/pagos', { params }),

    create: (colaboradorId: number, data: CreateColaboradorPagoDto) => 
        httpClient.post<number>(`/Colaborador/${colaboradorId}/pagos`, data),

    update: (id: number, data: CreateColaboradorPagoDto) => 
        httpClient.put<void>(`/Colaborador/pagos/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/pagos/${id}`)
};
