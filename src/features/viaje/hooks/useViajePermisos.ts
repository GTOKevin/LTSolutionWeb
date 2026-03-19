import { useQuery } from '@tanstack/react-query';
import { viajePermisoApi } from '@/entities/viaje/api/viaje-permiso.api';
import type { CreateViajePermisoDto, PagedViajePermisos } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { createViajeSubresourceHooks } from './useViajeSubresourceCrud';

const EMPTY_PAGED_PERMISOS: PagedViajePermisos = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajePermisos = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.permisos(viajeId ?? 0, page, size),
        queryFn: () => viajeId ? viajePermisoApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_PERMISOS),
        enabled: !!viajeId
    });
};

export const {
    useCreate: useCreateViajePermiso,
    useUpdate: useUpdateViajePermiso,
    useDelete: useDeleteViajePermiso
} = createViajeSubresourceHooks<CreateViajePermisoDto>(
    viajePermisoApi,
    'Permiso',
    VIAJE_QUERY_KEYS.permisos
);
