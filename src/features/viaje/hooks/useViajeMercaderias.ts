import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeMercaderiaApi } from '@/entities/viaje/api/viaje-mercaderia.api';
import type { CreateViajeMercaderiaDto, PagedViajeMercaderias } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';

const EMPTY_PAGED_MERCADERIAS: PagedViajeMercaderias = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0
};

export const useViajeMercaderias = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: ['viaje-mercaderias', viajeId, page, size],
        queryFn: () => viajeId ? viajeMercaderiaApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_MERCADERIAS),
        enabled: !!viajeId
    });
};

export const useCreateViajeMercaderia = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeMercaderiaDto }) => 
            viajeMercaderiaApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-mercaderias', viajeId] });
            showToast({ entity: 'Mercadería', action: 'create' });
        },
        onError: () => {
            showToast({ entity: 'Mercadería', action: 'create', isError: true });
        }
    });
};

export const useUpdateViajeMercaderia = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeMercaderiaDto; viajeId: number }) => 
            viajeMercaderiaApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-mercaderias', viajeId] });
            showToast({ entity: 'Mercadería', action: 'update' });
        },
        onError: () => {
            showToast({ entity: 'Mercadería', action: 'update', isError: true });
        }
    });
};

export const useDeleteViajeMercaderia = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeMercaderiaApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-mercaderias', viajeId] });
            showToast({ entity: 'Mercadería', action: 'delete' });
        },
        onError: () => {
            showToast({ entity: 'Mercadería', action: 'delete', isError: true });
        }
    });
};
