import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeGastoApi } from '@/entities/viaje/api/viaje-gasto.api';
import type { CreateViajeGastoDto } from '@/entities/viaje/model/types';

export const useViajeGastos = (viajeId?: number) => {
    return useQuery({
        queryKey: ['viaje-gastos', viajeId],
        queryFn: () => viajeId ? viajeGastoApi.getByViaje(viajeId) : Promise.resolve([]),
        enabled: !!viajeId
    });
};

export const useCreateViajeGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeGastoDto }) => 
            viajeGastoApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-gastos', viajeId] });
        }
    });
};

export const useUpdateViajeGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeGastoDto; viajeId: number }) => 
            viajeGastoApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-gastos', viajeId] });
        }
    });
};

export const useDeleteViajeGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeGastoApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-gastos', viajeId] });
        }
    });
};
