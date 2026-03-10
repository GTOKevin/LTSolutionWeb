import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeMercaderiaApi } from '@/entities/viaje/api/viaje-mercaderia.api';
import type { CreateViajeMercaderiaDto } from '@/entities/viaje/model/types';

export const useViajeMercaderias = (viajeId?: number) => {
    return useQuery({
        queryKey: ['viaje-mercaderias', viajeId],
        queryFn: () => viajeId ? viajeMercaderiaApi.getByViaje(viajeId) : Promise.resolve([]),
        enabled: !!viajeId
    });
};

export const useCreateViajeMercaderia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ viajeId, data }: { viajeId: number; data: CreateViajeMercaderiaDto }) => 
            viajeMercaderiaApi.create(viajeId, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-mercaderias', viajeId] });
        }
    });
};

export const useUpdateViajeMercaderia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data, viajeId }: { id: number; data: CreateViajeMercaderiaDto; viajeId: number }) => 
            viajeMercaderiaApi.update(id, data),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-mercaderias', viajeId] });
        }
    });
};

export const useDeleteViajeMercaderia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: number; viajeId: number }) => 
            viajeMercaderiaApi.delete(id),
        onSuccess: (_, { viajeId }) => {
            queryClient.invalidateQueries({ queryKey: ['viaje-mercaderias', viajeId] });
        }
    });
};
