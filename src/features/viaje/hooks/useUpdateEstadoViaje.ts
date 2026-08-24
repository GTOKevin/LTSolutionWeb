import { useMutation, useQueryClient } from '@tanstack/react-query';
import { viajeApi } from '@/entities/viaje/api/viaje.api';
import type { UpdateEstadoViajePayload } from '@/entities/viaje/model/types';
import { VIAJE_QUERY_KEYS } from '../model/query-keys';
import { useToast } from '@/shared/components/ui/Toast';
import { getErrorMessage, type ApiMutationError } from '@/shared/utils/api-errors';

export interface UpdateEstadoViajeOptimistic {
    estadoCodigo: string;
    estadoNombre: string;
}

export interface UpdateEstadoViajeVariables {
    id: number;
    estadoId: number;
    fechaPartida?: string;
    fechaDescarga?: string;
    /** Payload visual opcional para el optimistic update del listado (columnas del kanban). */
    optimistic?: UpdateEstadoViajeOptimistic;
}

interface UpdateEstadoViajeMutationContext {
    snapshot: Array<[unknown, unknown]>;
}

/**
 * Aplica el cambio de estado de forma optimista sobre todas las queries de listado
 * (`VIAJE_QUERY_KEYS.lists()`), que comparten la forma `PagedResponse<ViajeListItem>`.
 * Devuelve el mismo dato si la forma no coincide (sin tocar nada).
 */
function applyOptimisticListUpdate(data: unknown, variables: UpdateEstadoViajeVariables): unknown {
    if (!data || typeof data !== 'object') {
        return data;
    }

    const items = (data as { items?: unknown }).items;
    if (!Array.isArray(items)) {
        return data;
    }

    return {
        ...data,
        items: items.map((item) => {
            if (!item || typeof item !== 'object' || (item as { viajeID?: number }).viajeID !== variables.id) {
                return item;
            }

            return {
                ...item,
                estadoID: variables.estadoId,
                estadoCodigo: variables.optimistic?.estadoCodigo,
                estadoNombre: variables.optimistic?.estadoNombre,
                ...(variables.fechaPartida ? { fechaPartida: variables.fechaPartida } : {}),
                ...(variables.fechaDescarga ? { fechaDescarga: variables.fechaDescarga } : {}),
            };
        }),
    };
}

/**
 * Mutation de cambio de estado de viaje con patrón React Query declarativo:
 * - `onMutate`: snapshot + cancelación de queries y optimistic update del listado.
 * - `onError`: rollback del snapshot (deshace el optimistic update).
 * - `onSettled`: invalidación de listas/edit/detalle (una sola vez).
 */
export function useUpdateEstadoViaje() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, estadoId, fechaPartida, fechaDescarga }: UpdateEstadoViajeVariables) => {
            const payload: UpdateEstadoViajePayload = { estadoId, fechaPartida, fechaDescarga };
            return viajeApi.updateEstado(id, payload);
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            const snapshot = queryClient.getQueriesData({ queryKey: VIAJE_QUERY_KEYS.lists() });

            if (variables.optimistic) {
                queryClient.setQueriesData(
                    { queryKey: VIAJE_QUERY_KEYS.lists() },
                    (old) => applyOptimisticListUpdate(old, variables),
                );
            }

            return { snapshot } satisfies UpdateEstadoViajeMutationContext;
        },
        onError: (error: ApiMutationError, _variables, context) => {
            if (context?.snapshot) {
                context.snapshot.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
            }
            showToast({ message: getErrorMessage(error) || 'Error al actualizar el estado', severity: 'error' });
        },
        onSuccess: () => {
            showToast({ message: 'Estado del viaje actualizado', severity: 'success' });
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.edit(variables.id) });
            queryClient.invalidateQueries({ queryKey: VIAJE_QUERY_KEYS.detail(variables.id) });
        },
    });
}