import { httpClient } from '@shared/api/http';
import type { SelestListItem } from '@/shared/model/types';

export const tipoProductoApi = {
    getSelect: (search?: string, limit: number = 20, category?: string) =>
        httpClient.get<SelestListItem[]>('/TipoProducto/select', { params: { search, limit, category } }),
        
    getSelectCategoria: () =>
        httpClient.get<SelestListItem[]>('/TipoProducto/Categoria/select'),
};
