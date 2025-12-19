import { httpClient } from '@shared/api/http';
import type { SelestListItem } from '@/shared/model/types';

export const monedaApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelestListItem[]>('/Moneda/select', { params: { search, limit } }),
};
