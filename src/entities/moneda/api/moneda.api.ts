import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@shared/model/types';

export const monedaApi = {
    getSelect: async (search?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/Moneda/select', { params: { search, limit } });
        return data;
    },
};
