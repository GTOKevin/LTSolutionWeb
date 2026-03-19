import { useQuery } from '@tanstack/react-query';
import { viajeMercaderiaApi } from '@/entities/viaje/api/viaje-mercaderia.api';
import type { CreateViajeMercaderiaDto, PagedViajeMercaderias } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { createViajeSubresourceHooks } from './useViajeSubresourceCrud';

const EMPTY_PAGED_MERCADERIAS: PagedViajeMercaderias = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeMercaderias = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.mercaderias(viajeId ?? 0, page, size),
        queryFn: () => viajeId ? viajeMercaderiaApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_MERCADERIAS),
        enabled: !!viajeId
    });
};

export const {
    useCreate: useCreateViajeMercaderia,
    useUpdate: useUpdateViajeMercaderia,
    useDelete: useDeleteViajeMercaderia
} = createViajeSubresourceHooks<CreateViajeMercaderiaDto>(
    viajeMercaderiaApi,
    'Mercadería',
    VIAJE_QUERY_KEYS.mercaderias
);
