import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';
import { logger } from '@/shared/utils/logger';

/**
 * Cierra un viaje (POST /viaje/{id}/cerrar). El backend valida integridad
 * (fechas + kms + >= 1 guía) y devuelve mensaje claro si faltan datos.
 * Al cerrar se invalidan listas y detalle para reflejar `cerrado = true`.
 */
export function useCerrarViaje(onSuccessFallback?: () => void) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (id: number) => viajeApi.cerrar(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.edit(id) });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(id) });
            showToast({ entity: 'Viaje', action: 'cerrar' });
            onSuccessFallback?.();
        },
        onError: (error: ApiMutationError) => {
            const message = getErrorMessage(error, 'No se pudo cerrar el viaje.');
            showToast({ entity: 'Viaje', action: 'cerrar', isError: true, message });
            logger.error('Error cerrando viaje:', message);
        },
    });
}
