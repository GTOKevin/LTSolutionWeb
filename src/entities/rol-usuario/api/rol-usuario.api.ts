import { httpClient } from '@shared/api/http';
import type { SelestListItem } from '@/shared/model/types';

export const rolUsuarioApi = {
    getSelect: (search?: string, limit: number = 20) =>
        httpClient.get<SelestListItem[]>('/RolUsuario/select', { params: { search, limit } }),
};
