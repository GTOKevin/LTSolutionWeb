import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { viajeIncidenteApi } from '@/entities/viaje/api/viaje-incidente.api';
import type { CreateViajeIncidenteDto, PagedViajeIncidentes } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import type { ApiError } from '@/shared/api/http';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';

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

type ViajeMutationError = AxiosError<ApiError & { message?: string }>;

export const useCreateViajeIncidente = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeIncidenteDto }) => 
            viajeIncidenteApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.incidentes(viajeId) });
            showToast({ entity: 'Incidente', action: 'create' });
        },
        onError: (error: ViajeMutationError) => {
            const message = error.response?.data?.message || error.response?.data?.detail;
            showToast({ entity: 'Incidente', action: 'create', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useUpdateViajeIncidente = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateViajeIncidenteDto; viajeId: number }) => 
            viajeIncidenteApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.incidentes(viajeId) });
            showToast({ entity: 'Incidente', action: 'update' });
        },
        onError: (error: ViajeMutationError) => {
            const message = error.response?.data?.message || error.response?.data?.detail;
            showToast({ entity: 'Incidente', action: 'update', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useDeleteViajeIncidente = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeIncidenteApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.incidentes(viajeId) });
            showToast({ entity: 'Incidente', action: 'delete' });
        },
        onError: (error: ViajeMutationError) => {
            const message = error.response?.data?.message || error.response?.data?.detail;
            showToast({ entity: 'Incidente', action: 'delete', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};
