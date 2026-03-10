import { httpClient } from './http';
import type { SelectItem } from '@/shared/model/types';

export const gastoApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Gasto/select', { params: { search, limit } })
};
