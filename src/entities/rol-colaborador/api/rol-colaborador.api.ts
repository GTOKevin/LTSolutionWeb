import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@/shared/model/types';

export const rolColaboradorApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelectItem[]>('/RolColaborador/select', { params: { search, limit } }),
};
