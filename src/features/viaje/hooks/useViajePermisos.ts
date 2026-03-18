import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajePermisoApi } from '@/entities/viaje/api/viaje-permiso.api';
import type { CreateViajePermisoDto, PagedViajePermisos } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';

const EMPTY_PAGED_PERMISOS: PagedViajePermisos = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajePermisos = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: viajeId ? [...VIAJE_QUERY_KEYS.permisos(viajeId), page, size] : ['viaje-permisos', undefined, page, size],
        queryFn: () => viajeId ? viajePermisoApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_PERMISOS),
        enabled: !!viajeId
    });
};

export const useCreateViajePermiso = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajePermisoDto }) => 
            viajePermisoApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.permisos(viajeId) });
            showToast({ entity: 'Permiso', action: 'create' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Permiso', action: 'create', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useUpdateViajePermiso = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateViajePermisoDto; viajeId: number }) => 
            viajePermisoApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.permisos(viajeId) });
            showToast({ entity: 'Permiso', action: 'update' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Permiso', action: 'update', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useDeleteViajePermiso = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajePermisoApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.permisos(viajeId) });
            showToast({ entity: 'Permiso', action: 'delete' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Permiso', action: 'delete', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};
