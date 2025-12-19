import { httpClient } from '@shared/api/http';
import type { SelestListItem } from '@/shared/model/types';

export const tipoDocumentoApi = {
    getSelect: (search?: string, seccion?: string, limit: number = 20) =>
        httpClient.get<SelestListItem[]>('/TipoDocumento/select', { params: { search, seccion, limit } }),
};
