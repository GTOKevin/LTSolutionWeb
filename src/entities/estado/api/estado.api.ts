import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@shared/model/types';

export const estadoApi = {
    getSelect: async (search?: string, limit: number = 20, seccion?: string) => {
        const { data } = await httpClient.get<SelectItem[]>('/Estado/select', { params: { search, limit, seccion } });
        return data;
    },
};
