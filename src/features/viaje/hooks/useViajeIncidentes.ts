import { useQuery } from '@tanstack/react-query';
import { viajeIncidenteApi } from '@/entities/viaje/api/viaje-incidente.api';
import type { CreateViajeIncidenteDto, PagedViajeIncidentes } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { createViajeSubresourceHooks } from './useViajeSubresourceCrud';

const EMPTY_PAGED_INCIDENTES: PagedViajeIncidentes = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeIncidentes = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.incidentes(viajeId ?? 0, page, size),
        queryFn: () => viajeId ? viajeIncidenteApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_INCIDENTES),
        enabled: !!viajeId
    });
};

export const {
    useCreate: useCreateViajeIncidente,
    useUpdate: useUpdateViajeIncidente,
    useDelete: useDeleteViajeIncidente
} = createViajeSubresourceHooks<CreateViajeIncidenteDto>(
    viajeIncidenteApi,
    'Incidente',
    VIAJE_QUERY_KEYS.incidentes
);
