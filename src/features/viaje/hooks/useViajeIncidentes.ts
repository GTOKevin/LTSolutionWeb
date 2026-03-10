import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeIncidenteApi } from '@/entities/viaje/api/viaje-incidente.api';
import type { CreateViajeIncidenteDto } from '@/entities/viaje/model/types';

export const useViajeIncidentes = (viajeId?: number) => {
    return useQuery({
        queryKey: ['viaje-incidentes', viajeId],
        queryFn: () => viajeId ? viajeIncidenteApi.getByViaje(viajeId) : Promise.resolve([]),
        enabled: !!viajeId
    });
};

export const useCreateViajeIncidente = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeIncidenteDto }) => 
            viajeIncidenteApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-incidentes', viajeId] });
        }
    });
};

export const useUpdateViajeIncidente = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeIncidenteDto; viajeId: number }) => 
            viajeIncidenteApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-incidentes', viajeId] });
        }
    });
};

export const useDeleteViajeIncidente = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeIncidenteApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-incidentes', viajeId] });
        }
    });
};
