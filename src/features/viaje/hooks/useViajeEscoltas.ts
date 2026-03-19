import { useQuery } from '@tanstack/react-query';
import { viajeEscoltaApi } from '@/entities/viaje/api/viaje-escolta.api';
import type { CreateViajeEscoltaDto, PagedViajeEscoltas } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { createViajeSubresourceHooks } from './useViajeSubresourceCrud';

const EMPTY_PAGED_ESCOLTAS: PagedViajeEscoltas = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeEscoltas = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.escoltas(viajeId ?? 0, page, size),
        queryFn: () => viajeId ? viajeEscoltaApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_ESCOLTAS),
        enabled: !!viajeId
    });
};

export const {
    useCreate: useCreateViajeEscolta,
    useUpdate: useUpdateViajeEscolta,
    useDelete: useDeleteViajeEscolta
} = createViajeSubresourceHooks<CreateViajeEscoltaDto>(
    viajeEscoltaApi,
    'Escolta',
    VIAJE_QUERY_KEYS.escoltas
);
