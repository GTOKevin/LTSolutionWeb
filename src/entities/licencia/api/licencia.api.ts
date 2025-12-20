import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@shared/api/types';
import type { Licencia, CreateLicenciaDto, LicenciaParams } from '../model/types';

export const licenciaApi = {
    getAll: (params: LicenciaParams) => 
        httpClient.get<PagedResponse<Licencia>>('/Colaborador/licencias', { params }),

    getById: (id: number) => 
        httpClient.get<Licencia>(`/Colaborador/licencias/${id}`), // Note: Controller doesn't have GetById for Licencia specifically, but let's keep it or remove if unused. The list comes from getAll.

    create: (colaboradorId: number, data: CreateLicenciaDto) => 
        httpClient.post<number>(`/Colaborador/${colaboradorId}/licencias`, data),

    update: (id: number, data: CreateLicenciaDto) => 
        httpClient.put<void>(`/Colaborador/licencias/${id}`, data),

    delete: (id: number) => 
        httpClient.delete<void>(`/Colaborador/licencias/${id}`)
};
