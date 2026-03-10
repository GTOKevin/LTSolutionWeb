import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@/shared/model/types';


export const flotaApi = {

    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Flota/select', { params: { search, limit } }),

    getSelectTipo: (tipo?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Flota/tipo-select', { params: { tipo, limit } }),
};
