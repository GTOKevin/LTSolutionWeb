import { httpClient } from '@shared/api/http';
import type { SelestListItem } from '@/shared/model/types';

export const estadoApi = {
    getSelect: (search?: string, limit: number = 20, seccion?: string) =>
        httpClient.get<SelestListItem[]>('/Estado/select', { params: { search, limit, seccion } }),
};
