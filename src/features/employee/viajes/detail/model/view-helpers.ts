import { formatDateCustom, formatDateTime, getCurrentDateISO, getCurrentTimeISO } from '@shared/utils/date-utils';
import {
    resolveViajePermisoStatus,
    type ViajePermisoStatus,
} from '@entities/viaje/model/permiso-status';

// Re-export del resolutor de vigencia neutral (dominio viaje) para compatibilidad
// con los consumidores del portal empleado.
export { resolveViajePermisoStatus as resolveEmployeeViajePermisoStatus };
export type { ViajePermisoStatus as EmployeeViajePermisoStatus };

export const employeeViajeDetailStyles = {
    heroHeader: {
        background: 'linear-gradient(180deg, rgba(248, 249, 250, 0.96) 0%, rgba(248, 249, 250, 0.88) 100%)',
        backdropFilter: 'blur(16px)',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 4,
        p: 3,
        boxShadow: 'none',
        border: '1px solid rgba(192, 199, 212, 0.5)',
    },
    mutedCard: {
        backgroundColor: 'rgba(248, 250, 252, 0.95)',
        borderRadius: 3,
        p: 2.5,
        border: '1px solid rgba(203, 213, 225, 0.65)',
    },
    heroStat: {
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 3,
        border: '1px solid rgba(203, 213, 225, 0.8)',
        p: 2,
        minWidth: 0,
    },
    softPanel: {
        borderRadius: 3,
        border: '1px solid rgba(203, 213, 225, 0.65)',
        backgroundColor: 'rgba(248, 250, 252, 0.82)',
        p: 2.5,
    },
} as const;

export function formatEmployeeViajeDateLabel(value?: string | null): string {
    if (!value) {
        return 'Sin informacion';
    }

    return formatDateCustom(value, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }) || value;
}

export function formatEmployeeViajeDateTimeLabel(value?: string | null): string {
    if (!value) {
        return 'Sin informacion';
    }

    return formatDateTime(value) || value;
}

export function formatEmployeeViajeKmLabel(value?: number | null): string {
    if (value === null || value === undefined) {
        return 'Sin registrar';
    }

    return `${value} km`;
}

export function getCurrentEmployeeViajeDateInput() {
    return getCurrentDateISO();
}

export function getCurrentEmployeeViajeTimeInput() {
    return getCurrentTimeISO();
}

export type EmployeeViajeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export function resolveEmployeeViajeToneColors(tone: EmployeeViajeTone) {
    switch (tone) {
        case 'success':
            return {
                bg: 'success.light',
                text: 'success.dark',
                border: 'success.main',
            };
        case 'warning':
            return {
                bg: 'warning.light',
                text: 'warning.dark',
                border: 'warning.main',
            };
        case 'error':
            return {
                bg: 'error.light',
                text: 'error.dark',
                border: 'error.main',
            };
        case 'info':
            return {
                bg: 'info.light',
                text: 'info.dark',
                border: 'info.main',
            };
        default:
            return {
                bg: 'grey.200',
                text: 'text.primary',
                border: 'divider',
            };
    }
}
