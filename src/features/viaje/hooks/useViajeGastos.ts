import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeGastoApi } from '@/entities/viaje/api/viaje-gasto.api';
import type { CreateViajeGastoDto, PagedViajeGastos } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';

const EMPTY_PAGED_GASTOS: PagedViajeGastos = {
    items: [],
    total: 0,
    page: 1,
    size: 5,
    totalPages: 0,
    totalsByCurrency: [
        { code: 'PEN', symbol: 'S/.', total: 0 },
        { code: 'USD', symbol: '$', total: 0 },
        { code: 'EUR', symbol: '€', total: 0 }
    ]
};

export const useViajeGastos = (viajeId?: number, page = 1, size = 5) => {
    return useQuery({
        queryKey: VIAJE_QUERY_KEYS.gastos(viajeId || 0, page, size),
        queryFn: () => viajeId ? viajeGastoApi.getByViaje(viajeId, { page, size }) : Promise.resolve(EMPTY_PAGED_GASTOS),
        enabled: !!viajeId
    });
};

export const useCreateViajeGasto = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeGastoDto }) => 
            viajeGastoApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.gastos(viajeId) });
            showToast({ entity: 'Gasto', action: 'create' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Gasto', action: 'create', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useUpdateViajeGasto = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateViajeGastoDto; viajeId: number }) => 
            viajeGastoApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.gastos(viajeId) });
            showToast({ entity: 'Gasto', action: 'update' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Gasto', action: 'update', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};

export const useDeleteViajeGasto = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeGastoApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.gastos(viajeId) });
            showToast({ entity: 'Gasto', action: 'delete' });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message;
            showToast({ entity: 'Gasto', action: 'delete', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });
};
