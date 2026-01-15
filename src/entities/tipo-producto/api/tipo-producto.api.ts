import { httpClient } from '@shared/api/http';
import type { SelectItem } from '@/shared/model/types';

export const tipoProductoApi = {
    getSelect: (search?: string, limit: number = 20, category?: string) =>
        httpClient.get<SelectItem[]>('/TipoProducto/select', { params: { search, limit, category } }),
        
    getSelectCategoria: () =>
        httpClient.get<SelectItem[]>('/TipoProducto/Categoria/select'),
};
