import { httpClient } from './http';
import type { SelectItem } from '@/shared/model/types';

export const mercaderiaApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/Mercaderia/select', { params: { search, limit } })
};
