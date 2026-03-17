import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeGuiaApi } from '@/entities/viaje/api/viaje-guia.api';
import type { CreateViajeGuiaDto, PagedViajeGuias } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';

const EMPTY_PAGED_GUIAS: PagedViajeGuias = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeGuias = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: ['viaje-guias', viajeId, page, size],
        queryFn: () => viajeId ? viajeGuiaApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_GUIAS),
        enabled: !!viajeId
    });
};

export const useCreateViajeGuia = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeGuiaDto }) => 
            viajeGuiaApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-guias', viajeId] });
            showToast({ entity: 'Guía', action: 'create' });
        },
        onError: () => {
            showToast({ entity: 'Guía', action: 'create', isError: true });
        }
    });
};

export const useUpdateViajeGuia = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeGuiaDto; viajeId: number }) => 
            viajeGuiaApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-guias', viajeId] });
            showToast({ entity: 'Guía', action: 'update' });
        },
        onError: () => {
            showToast({ entity: 'Guía', action: 'update', isError: true });
        }
    });
};

export const useDeleteViajeGuia = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeGuiaApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-guias', viajeId] });
            showToast({ entity: 'Guía', action: 'delete' });
        },
        onError: () => {
            showToast({ entity: 'Guía', action: 'delete', isError: true });
        }
    });
};
