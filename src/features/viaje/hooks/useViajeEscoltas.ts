import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeEscoltaApi } from '@/entities/viaje/api/viaje-escolta.api';
import type { CreateViajeEscoltaDto, PagedViajeEscoltas } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';

const EMPTY_PAGED_ESCOLTAS: PagedViajeEscoltas = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeEscoltas = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: ['viaje-escoltas', viajeId, page, size],
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
            queryClient.invalidateQueries({ queryKey: ['viaje-escoltas', viajeId] });
            showToast({ entity: 'Escolta', action: 'create' });
        },
        onError: () => {
            showToast({ entity: 'Escolta', action: 'create', isError: true });
        }
    });
};

export const useUpdateViajeEscolta = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeEscoltaDto; viajeId: number }) => 
            viajeEscoltaApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-escoltas', viajeId] });
            showToast({ entity: 'Escolta', action: 'update' });
        },
        onError: () => {
            showToast({ entity: 'Escolta', action: 'update', isError: true });
        }
    });
};

export const useDeleteViajeEscolta = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, viajeId }: { id: number; viajeId: number }) => 
            viajeEscoltaApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-escoltas', viajeId] });
            showToast({ entity: 'Escolta', action: 'delete' });
        },
        onError: () => {
            showToast({ entity: 'Escolta', action: 'delete', isError: true });
        }
    });
};
