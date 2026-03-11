import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeEscoltaApi } from '@/entities/viaje/api/viaje-escolta.api';
import type { CreateViajeEscoltaDto } from '@/entities/viaje/model/types';

export const useViajeEscoltas = (viajeId?: number) => {
    return useQuery({
        queryKey: ['viaje-escoltas', viajeId],
        queryFn: () => viajeId ? viajeEscoltaApi.getByViaje(viajeId) : Promise.resolve([]),
        enabled: !!viajeId
    });
};

export const useCreateViajeEscolta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeEscoltaDto }) => 
            viajeEscoltaApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-escoltas', viajeId] });
        }
    });
};

export const useUpdateViajeEscolta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeEscoltaDto; viajeId: number }) => 
            viajeEscoltaApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-escoltas', viajeId] });
        }
    });
};

export const useDeleteViajeEscolta = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, viajeId }: { id: number; viajeId: number }) => 
            viajeEscoltaApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-escoltas', viajeId] });
        }
    });
};
