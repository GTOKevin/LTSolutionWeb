import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajePermisoApi } from '@/entities/viaje/api/viaje-permiso.api';
import type { CreateViajePermisoDto, PagedViajePermisos } from '@/entities/viaje/model/types';

const EMPTY_PAGED_PERMISOS: PagedViajePermisos = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajePermisos = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: ['viaje-permisos', viajeId, page, size],
        queryFn: () => viajeId ? viajePermisoApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_PERMISOS),
        enabled: !!viajeId
    });
};

export const useCreateViajePermiso = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajePermisoDto }) => 
            viajePermisoApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-permisos', viajeId] });
        }
    });
};

export const useUpdateViajePermiso = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajePermisoDto; viajeId: number }) => 
            viajePermisoApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-permisos', viajeId] });
        }
    });
};

export const useDeleteViajePermiso = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, viajeId }: { id: number; viajeId: number }) => 
            viajePermisoApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-permisos', viajeId] });
        }
    });
};
