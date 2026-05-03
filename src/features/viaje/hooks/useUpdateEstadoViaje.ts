import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';

export function useUpdateEstadoViaje(onErrorFallback: () => void) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, estadoId }: { id: number, estadoId: number }) => {
            return viajeApi.updateEstado(id, estadoId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            showToast({ message: 'Estado del viaje actualizado', severity: 'success' });
        },
        onError: (error:ApiMutationError) => {
            onErrorFallback();
            showToast({ message: getErrorMessage(error) || 'Error al actualizar el estado', severity: 'error' });
        }
    });
}