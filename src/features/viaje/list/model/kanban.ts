import { alpha } from '@mui/material/styles';
import type { SelectItem } from '@shared/model/types';
import type { ViajeListItem } from '@/entities/viaje/model/types';
import {
    resolveViajeAgendadoId,
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
    VIAJE_STATUS_CODE,
} from '@entities/viaje/model/status';

export interface ViajeKanbanColumnDefinition {
    id: string;
    title: string;
    color: string;
    bgColor: string;
    estadoId?: number;
}

export function resolveViajeKanbanColumns(
    viajes: ViajeListItem[] | undefined,
    viajeEstados: SelectItem[] | undefined,
): ViajeKanbanColumnDefinition[] {
    const firstViajePerCode: Record<string, number | undefined> = {};

    for (const viaje of viajes ?? []) {
        if (!viaje.estadoCodigo || firstViajePerCode[viaje.estadoCodigo] !== undefined) {
            continue;
        }

        firstViajePerCode[viaje.estadoCodigo] = viaje.estadoID;
    }

    return [
        {
            id: VIAJE_STATUS_CODE.AGENDADO,
            title: 'Programado',
            color: '#94a3b8',
            bgColor: alpha('#94a3b8', 0.05),
            estadoId: firstViajePerCode[VIAJE_STATUS_CODE.AGENDADO] ?? resolveViajeAgendadoId(viajeEstados),
        },
        {
            id: VIAJE_STATUS_CODE.TRANSITO,
            title: 'En Ruta',
            color: '#2563eb',
            bgColor: alpha('#2563eb', 0.05),
            estadoId: firstViajePerCode[VIAJE_STATUS_CODE.TRANSITO] ?? resolveViajeTransitoId(viajeEstados),
        },
        {
            id: VIAJE_STATUS_CODE.DESCARGANDO,
            title: 'En Descarga',
            color: '#f59e0b',
            bgColor: alpha('#f59e0b', 0.05),
            estadoId: firstViajePerCode[VIAJE_STATUS_CODE.DESCARGANDO] ?? resolveViajeDescargandoId(viajeEstados),
        },
        {
            id: VIAJE_STATUS_CODE.COMPLETADO,
            title: 'Completado',
            color: '#388e3c',
            bgColor: alpha('#388e3c', 0.05),
            estadoId: firstViajePerCode[VIAJE_STATUS_CODE.COMPLETADO] ?? resolveViajeCompletadoId(viajeEstados),
        },
    ];
}
