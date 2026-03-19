import { useQuery } from '@tanstack/react-query';
import { viajeGuiaApi } from '@/entities/viaje/api/viaje-guia.api';
import type { CreateViajeGuiaDto, PagedViajeGuias } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { createViajeSubresourceHooks } from './useViajeSubresourceCrud';

const EMPTY_PAGED_GUIAS: PagedViajeGuias = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeGuias = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.guias(viajeId ?? 0, page, size),
        queryFn: () => viajeId ? viajeGuiaApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_GUIAS),
        enabled: !!viajeId
    });
};

export const {
    useCreate: useCreateViajeGuia,
    useUpdate: useUpdateViajeGuia,
    useDelete: useDeleteViajeGuia
} = createViajeSubresourceHooks<CreateViajeGuiaDto>(
    viajeGuiaApi,
    'Guía',
    VIAJE_QUERY_KEYS.guias
);
