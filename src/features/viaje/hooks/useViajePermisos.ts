import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajePermisoApi } from '@/entities/viaje/api/viaje-permiso.api';
import type { CreateViajePermisoDto } from '@/entities/viaje/model/types';

export const useViajePermisos = (viajeId?: number) => {
    return useQuery({
        queryKey: ['viaje-permisos', viajeId],
        queryFn: () => viajeId ? viajePermisoApi.getByViaje(viajeId) : Promise.resolve([]),
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
