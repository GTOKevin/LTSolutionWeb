import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { UpdateEstadoViajePayload } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';

export interface UpdateEstadoViajeVariables {
    id: number;
    estadoId: number;
    fechaPartida?: string;
    fechaDescarga?: string;
}

export function useUpdateEstadoViaje(onErrorFallback: () => void) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, estadoId, fechaPartida, fechaDescarga }: UpdateEstadoViajeVariables) => {
            const payload: UpdateEstadoViajePayload = { estadoId, fechaPartida, fechaDescarga };
            return viajeApi.updateEstado(id, payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.edit(variables.id) });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(variables.id) });
            showToast({ message: 'Estado del viaje actualizado', severity: 'success' });
        },
        onError: (error: ApiMutationError) => {
            onErrorFallback();
            showToast({ message: getErrorMessage(error) || 'Error al actualizar el estado', severity: 'error' });
        }
    });
}