import { useQuery } from '@tanstack/react-query';
import { viajeGastoApi } from '@/entities/viaje/api/viaje-gasto.api';
import type { CreateViajeGastoDto, PagedViajeGastos } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { createViajeSubresourceHooks } from './useViajeSubresourceCrud';

const EMPTY_PAGED_GASTOS: PagedViajeGastos = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0,
    totalsByCurrency: []
};

export const useViajeGastos = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.gastos(viajeId ?? 0, page, size),
        queryFn: () => viajeId ? viajeGastoApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_GASTOS),
        enabled: !!viajeId
    });
};

export const {
    useCreate: useCreateViajeGasto,
    useUpdate: useUpdateViajeGasto,
    useDelete: useDeleteViajeGasto
} = createViajeSubresourceHooks<CreateViajeGastoDto>(
    viajeGastoApi,
    'Gasto',
    VIAJE_QUERY_KEYS.gastos
);
