import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeEscoltaApi } from '@/entities/viaje/api/viaje-escolta.api';
import type { CreateViajeEscoltaDto, PagedViajeEscoltas } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';

const EMPTY_PAGED_ESCOLTAS: PagedViajeEscoltas = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeEscoltas = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: viajeId ? [...VIAJE_QUERY_KEYS.escoltas(viajeId), page, size] : ['viaje-escoltas', undefined, page, size],
        queryFn: () => viajeId ? viajeEscoltaApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_ESCOLTAS),
        enabled: !!viajeId
    });
};

export const useCreateViajeEscolta = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeEscoltaDto }) => 
            viajeEscoltaApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.escoltas(viajeId) });
            showToast({ entity: 'Escolta', action: 'create' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Escolta', action: 'create', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useUpdateViajeEscolta = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateViajeEscoltaDto; viajeId: number }) => 
            viajeEscoltaApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.escoltas(viajeId) });
            showToast({ entity: 'Escolta', action: 'update' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Escolta', action: 'update', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useDeleteViajeEscolta = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeEscoltaApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.escoltas(viajeId) });
            showToast({ entity: 'Escolta', action: 'delete' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Escolta', action: 'delete', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};
