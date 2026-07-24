import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@/shared/model/types';

export const tipoDocumentoApi = {
    getSelect: async (search?: string, seccion?: string, limit: number = 20) => {
        const { data } = await httpClient.get<SelectItem[]>('/TipoDocumento/select', { params: { search, seccion, limit } });
        return data;
    },
};
