import { httpClient } from '@shared/api/http';
import type { SelestListItem } from '@/shared/model/types';

export const rolColaboradorApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelestListItem[]>('/RolColaborador/select', { params: { search, limit } }),
};
