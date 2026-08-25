import { httpClient } from '@shared/api/http';
import type { PagedResponse } from '@/shared/model/types';
import type {
    CreateFacturaDocumentoDto,
    FacturaDocumento,
    FacturaDocumentoParams,
    UpdateFacturaDocumentoDto,
} from '../model/types';

export const facturaDocumentoApi = {
    getAll: async (params: FacturaDocumentoParams) => {
        const query = new URLSearchParams();
        query.append('facturaID', params.facturaID.toString());
        if (params.page != null) query.append('page', params.page.toString());
        if (params.size != null) query.append('size', params.size.toString());

        const { data } = await httpClient.get<PagedResponse<FacturaDocumento>>(`/factura/${params.facturaID}/documentos?${query.toString()}`);
        return data;
    },

    create: (facturaId: number, data: CreateFacturaDocumentoDto) =>
        httpClient.post<number>(`/factura/${facturaId}/documentos`, data).then((res) => res.data),

    update: (id: number, data: UpdateFacturaDocumentoDto) =>
        httpClient.put<void>(`/factura/documentos/${id}`, data),

    remove: (id: number) =>
        httpClient.delete<void>(`/factura/documentos/${id}`),
};