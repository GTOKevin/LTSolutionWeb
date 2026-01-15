import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@/shared/model/types';

export const monedaApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Moneda/select', { params: { search, limit } }),  
};
