import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import type { SelectItem } from '@shared/model/types';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import {
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
    VIAJE_STATUS_CODE,
    VIAJE_STATUS_FLOW_ORDER,
} from '@entities/viaje/model/status';
import { estadoApi } from '@entities/estado/api/estado.api';
import { ESTADO_SECTIONS } from '@entities/master-data/model/constants';
import { VIAJE_QUERY_KEYS } from '@features/viaje/model/query-keys';
import { useUpdateEstadoViaje } from '@features/viaje/hooks/useUpdateEstadoViaje';
import { ViajeEstadoDateDialog } from '../ui/kanban/ViajeEstadoDateDialog';

type PendingTransitionType = 'fechaPartida' | 'fechaDescarga' | 'completado';

interface PendingTransition {
    viaje: ViajeListItem;
    tipo: PendingTransitionType;
}

const NEXT_STATUS_DESCRIPTION: Partial<Record<(typeof VIAJE_STATUS_FLOW_ORDER)[number], string>> = {
    [VIAJE_STATUS_CODE.TRANSITO]: 'En Ruta',
    [VIAJE_STATUS_CODE.DESCARGANDO]: 'En Descarga',
    [VIAJE_STATUS_CODE.COMPLETADO]: 'Completado',
};

interface NextEstadoResolved {
    estadoId: number;
    estadoCodigo: string;
    descripcion: string;
    tipo: PendingTransitionType;
}

function resolveNextEstado(
    viaje: ViajeListItem,
    viajeEstados: SelectItem[] | undefined,
): NextEstadoResolved | null {
    const currentIndex = VIAJE_STATUS_FLOW_ORDER.indexOf(
        viaje.estadoCodigo as (typeof VIAJE_STATUS_FLOW_ORDER)[number],
    );
    if (currentIndex === -1) {
        return null;
    }

    const nextCode = VIAJE_STATUS_FLOW_ORDER[currentIndex + 1];
    if (!nextCode) {
        return null;
    }

    const descripcion = NEXT_STATUS_DESCRIPTION[nextCode];
    if (!descripcion) {
        return null;
    }

    if (nextCode === VIAJE_STATUS_CODE.TRANSITO) {
        const estadoId = resolveViajeTransitoId(viajeEstados);
        return estadoId ? { estadoId, estadoCodigo: nextCode, descripcion, tipo: 'fechaPartida' } : null;
    }

    if (nextCode === VIAJE_STATUS_CODE.DESCARGANDO) {
        const estadoId = resolveViajeDescargandoId(viajeEstados);
        return estadoId ? { estadoId, estadoCodigo: nextCode, descripcion, tipo: 'fechaDescarga' } : null;
    }

    const estadoId = resolveViajeCompletadoId(viajeEstados);
    return estadoId ? { estadoId, estadoCodigo: nextCode, descripcion, tipo: 'completado' } : null;
}

export function useViajeEstadoTransition() {
    const [pending, setPending] = useState<PendingTransition | null>(null);
    const [pendingDateValue, setPendingDateValue] = useState('');
    const updateEstadoMutation = useUpdateEstadoViaje();

    const { data: viajeEstados } = useQuery({
        queryKey: VIAJE_QUERY_KEYS.options.estados(),
        queryFn: async () => (await estadoApi.getSelect('', 20, ESTADO_SECTIONS.VIAJE)) ?? [],
    });

    const closeDialog = useCallback(() => {
        setPending(null);
        setPendingDateValue('');
    }, []);

    const handleAdvanceEstado = useCallback(
        (viaje: ViajeListItem) => {
            if (viaje.cerrado) {
                return;
            }

            const next = resolveNextEstado(viaje, viajeEstados);
            if (!next) {
                return;
            }

            const fechaInicial =
                next.tipo === 'fechaPartida'
                    ? (viaje.fechaPartida ?? '')
                    : next.tipo === 'fechaDescarga'
                        ? (viaje.fechaDescarga ?? '')
                        : '';

            setPendingDateValue(fechaInicial);
            setPending({ viaje, tipo: next.tipo });
        },
        [viajeEstados],
    );

    const applyTransition = (fecha?: string) => {
        if (!pending) {
            return;
        }

        const next = resolveNextEstado(pending.viaje, viajeEstados);
        if (!next) {
            closeDialog();
            return;
        }

        updateEstadoMutation.mutate(
            {
                id: pending.viaje.viajeID,
                estadoId: next.estadoId,
                ...(next.tipo === 'fechaPartida' ? { fechaPartida: fecha } : {}),
                ...(next.tipo === 'fechaDescarga' ? { fechaDescarga: fecha } : {}),
                optimistic: {
                    estadoCodigo: next.estadoCodigo,
                    estadoNombre: next.descripcion,
                },
            },
            { onSettled: closeDialog },
        );
    };

    const isCompletado = pending?.tipo === 'completado';
    const isFechaDialog = pending?.tipo === 'fechaPartida' || pending?.tipo === 'fechaDescarga';

    const modals = (
        <>
            <ConfirmDialog
                open={Boolean(pending) && isCompletado}
                title="Confirmar viaje completado"
                content="El viaje pasará a estado Completado. Para cerrarlo definitivamente (bloqueando modificaciones y generando los reportes) usa la acción «Cerrar viaje»."
                confirmText="Completar viaje"
                cancelText="Cancelar"
                severity="info"
                isLoading={updateEstadoMutation.isPending}
                onClose={closeDialog}
                onConfirm={() => applyTransition()}
            />

            <ViajeEstadoDateDialog
                open={Boolean(pending) && isFechaDialog}
                title={pending?.tipo === 'fechaPartida' ? 'Registrar fecha de partida' : 'Registrar fecha de descarga'}
                fieldLabel={pending?.tipo === 'fechaPartida' ? 'Fecha de partida' : 'Fecha de descarga'}
                value={pendingDateValue}
                onValueChange={setPendingDateValue}
                onCancel={closeDialog}
                onConfirm={() => applyTransition(pendingDateValue)}
                isLoading={updateEstadoMutation.isPending}
            />
        </>
    );

    return {
        modals,
        handleAdvanceEstado,
        getNextEstadoLabel: (viaje: ViajeListItem) => resolveNextEstado(viaje, viajeEstados)?.descripcion,
        getNextEstadoAvailable: (viaje: ViajeListItem) => Boolean(resolveNextEstado(viaje, viajeEstados)),
    };
}
