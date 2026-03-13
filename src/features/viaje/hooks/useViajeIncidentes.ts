import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeIncidenteApi } from '@/entities/viaje/api/viaje-incidente.api';
import type { CreateViajeIncidenteDto, PagedViajeIncidentes } from '@/entities/viaje/model/types';

const EMPTY_PAGED_INCIDENTES: PagedViajeIncidentes = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeIncidentes = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: ['viaje-incidentes', viajeId, page, size],
        queryFn: () => viajeId ? viajeIncidenteApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_INCIDENTES),
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
