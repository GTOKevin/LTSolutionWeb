import type { MiViajeDetailDto, MiViajeListItemDto } from '@entities/employee/model/types';
import type { SelectItem } from '@shared/model/types';
import {
    isViajeAgendado,
    isViajeCompletado,
    isViajeDescargando,
    isViajeTransito,
    resolveViajeCompletadoId,
    resolveViajeDescargandoId,
    resolveViajeTransitoId,
} from '@entities/viaje/model/status';

type EmployeeViajeWorkflowSource = MiViajeListItemDto | MiViajeDetailDto;

export interface EmployeeViajeWorkflowStep {
    key: 'agendado' | 'transito' | 'descargando' | 'completado';
    label: string;
    isCurrent: boolean;
    isCompleted: boolean;
    isPending: boolean;
}

function resolveEmployeeViajeWorkflowIndex(viaje: EmployeeViajeWorkflowSource | null | undefined) {
    if (!viaje) {
        return -1;
    }

    if (isViajeAgendado(viaje)) {
        return 0;
    }

    if (isViajeTransito(viaje)) {
        return 1;
    }

    if (isViajeDescargando(viaje)) {
        return 2;
    }

    if (isViajeCompletado(viaje)) {
        return 3;
    }

    return -1;
}

/**
 * El viaje no admite cambios de flujo ni nuevos registros: cerrado, facturado o completado.
 * Controla el badge "Bloqueado", las alertas y la deshabilitación de acciones en el portal.
 */
export function isEmployeeViajeWorkflowBlocked(viaje: EmployeeViajeWorkflowSource | null | undefined) {
    return Boolean(!viaje || viaje.cerrado || viaje.facturado || isViajeCompletado(viaje));
}

/**
 * El viaje está administrativamente cerrado: fin del ciclo de vida en el portal.
 * Es un criterio MÁS ESTRICTO que `isEmployeeViajeWorkflowBlocked`: mientras el viaje
 * esté solo facturado o completado (workflow bloqueado pero no cerrado), el empleado
 * aún puede corregir KMs y conserva visible el historial. Al cerrarse, se ocultan los
 * formularios de registro y las tabs de acción (Estado/KMs), dejando solo lectura.
 */
export function isEmployeeViajeClosed(viaje: EmployeeViajeWorkflowSource | null | undefined) {
    return Boolean(viaje?.cerrado);
}

export function getEmployeeViajeQuickActionLabel(viaje: EmployeeViajeWorkflowSource | null | undefined) {
    if (!viaje || isEmployeeViajeWorkflowBlocked(viaje)) {
        return null;
    }

    return isViajeAgendado(viaje) ? 'Iniciar tránsito' : 'Actualizar flujo';
}

export function resolveEmployeeViajeNextEstadoId(
    viaje: EmployeeViajeWorkflowSource | null | undefined,
    estados: SelectItem[] | undefined,
) {
    if (!viaje) {
        return null;
    }

    if (isViajeAgendado(viaje)) {
        return resolveViajeTransitoId(estados) ?? null;
    }

    if (isViajeTransito(viaje)) {
        return resolveViajeDescargandoId(estados) ?? null;
    }

    if (isViajeDescargando(viaje)) {
        return resolveViajeCompletadoId(estados) ?? null;
    }

    return null;
}

export function canEmployeeViajeEditFechaLlegada(viaje: EmployeeViajeWorkflowSource | null | undefined) {
    return Boolean(viaje && (isViajeTransito(viaje) || isViajeDescargando(viaje)));
}

export function getEmployeeViajeWorkflowSteps(viaje: EmployeeViajeWorkflowSource | null | undefined): EmployeeViajeWorkflowStep[] {
    const currentIndex = resolveEmployeeViajeWorkflowIndex(viaje);

    return [
        { key: 'agendado', label: 'Agendado', isCurrent: currentIndex === 0, isCompleted: currentIndex > 0, isPending: false },
        { key: 'transito', label: 'Tránsito', isCurrent: currentIndex === 1, isCompleted: currentIndex > 1, isPending: currentIndex >= 0 && currentIndex < 1 },
        { key: 'descargando', label: 'Descargando', isCurrent: currentIndex === 2, isCompleted: currentIndex > 2, isPending: currentIndex >= 0 && currentIndex < 2 },
        { key: 'completado', label: 'Completado', isCurrent: currentIndex === 3, isCompleted: currentIndex > 3, isPending: currentIndex >= 0 && currentIndex < 3 },
    ];
}

export function getEmployeeViajeWorkflowSummary(viaje: EmployeeViajeWorkflowSource | null | undefined) {
    if (!viaje) {
        return {
            statusLabel: 'Sin información',
            statusTone: 'neutral' as const,
        };
    }

    if (viaje.facturado) {
        return {
            statusLabel: 'Facturado',
            statusTone: 'success' as const,
        };
    }

    if (viaje.cerrado) {
        return {
            statusLabel: 'Cerrado',
            statusTone: 'warning' as const,
        };
    }

    if (isViajeCompletado(viaje)) {
        return {
            statusLabel: 'Completado',
            statusTone: 'success' as const,
        };
    }

    return {
        statusLabel: 'Operativo',
        statusTone: 'info' as const,
    };
}
