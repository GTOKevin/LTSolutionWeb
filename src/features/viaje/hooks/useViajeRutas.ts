import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { viajeRutaApi } from '@/entities/viaje/api/viajeRuta.api';
import type { CreateViajeRutaDto, ReorderViajeRutasDto, UpdateViajeRutaDto } from '@/entities/viaje/model/types';
import { useToast } from '@/shared/components/ui/Toast';
import { notifyMutationError, type ApiMutationError } from '@/shared/utils/api-errors';

export const viajeRutasKeys = {
    all: (viajeId: number) => ['viajes', viajeId, 'rutas'] as const,
    sugerencias: (viajeId: number) => ['viajes', viajeId, 'rutas', 'sugerencias'] as const,
};

export function useViajeRutas(viajeId: number) {
    return useQuery({
        queryKey: viajeRutasKeys.all(viajeId),
        queryFn: () => viajeRutaApi.getByViajeId(viajeId),
        enabled: !!viajeId,
    });
}

export function useViajeRutasSugeridas(viajeId: number) {
    return useQuery({
        queryKey: viajeRutasKeys.sugerencias(viajeId),
        queryFn: () => viajeRutaApi.getSugerencias(viajeId),
        enabled: !!viajeId,
    });
}

export function useCloneViajeRuta() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    return useMutation({
        mutationFn: (params: { viajeId: number; viajeIdReferencia: number }) => 
            viajeRutaApi.clonarRuta(params.viajeId, params.viajeIdReferencia),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: viajeRutasKeys.all(variables.viajeId) });
            showToast({ entity: 'Ruta de Viaje', action: 'create' });
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast, 'Ruta de Viaje', 'create', error);
        }
    });
}

export function useCreateViajeRuta() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    return useMutation({
        mutationFn: (params: { viajeId: number; data: CreateViajeRutaDto }) => 
            viajeRutaApi.create(params.viajeId, params.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: viajeRutasKeys.all(variables.viajeId) });
            showToast({ entity: 'Ruta de Viaje', action: 'create' });
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast, 'Ruta de Viaje', 'create', error);
        }
    });
}

export function useUpdateViajeRuta() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    return useMutation({
        mutationFn: (params: { viajeId: number; id: number; data: UpdateViajeRutaDto }) => 
            viajeRutaApi.update(params.viajeId, params.id, params.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: viajeRutasKeys.all(variables.viajeId) });
            showToast({ entity: 'Ruta de Viaje', action: 'update' });
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast, 'Ruta de Viaje', 'update', error);
        }
    });
}

export function useDeleteViajeRuta() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    return useMutation({
        mutationFn: (params: { viajeId: number; id: number }) => 
            viajeRutaApi.delete(params.viajeId, params.id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: viajeRutasKeys.all(variables.viajeId) });
            showToast({ entity: 'Ruta de Viaje', action: 'delete' });
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast, 'Ruta de Viaje', 'delete', error);
        }
    });
}

export function useReorderViajeRutas() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    return useMutation({
        mutationFn: (params: { viajeId: number; data: ReorderViajeRutasDto }) => 
            viajeRutaApi.reorder(params.viajeId, params.data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: viajeRutasKeys.all(variables.viajeId) });
            showToast({ entity: 'Rutas de Viaje', action: 'update' });
        },
        onError: (error: ApiMutationError) => {
            notifyMutationError(showToast, 'Rutas de Viaje', 'update', error);
        }
    });
}