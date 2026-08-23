import { getCurrentDateISO } from '@/shared/utils/date-utils';

export interface ViajePermisoStatus {
    label: string;
    color: 'success' | 'warning' | 'error';
}

function resolveDateOnlyUtcTime(value: string) {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return Date.UTC(year, month - 1, day);
}

export function resolveViajePermisoStatus(fechaVencimiento?: string | null): ViajePermisoStatus {
    if (!fechaVencimiento) {
        return {
            label: 'Vigente',
            color: 'success',
        };
    }

    const today = resolveDateOnlyUtcTime(getCurrentDateISO());
    const dueDate = resolveDateOnlyUtcTime(fechaVencimiento);

    if (!today || !dueDate) {
        return {
            label: 'Vigente',
            color: 'success',
        };
    }

    const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            label: 'Vencido',
            color: 'error',
        };
    }

    if (diffDays <= 2) {
        return {
            label: 'Por vencer',
            color: 'warning',
        };
    }

    return {
        label: 'Vigente',
        color: 'success',
    };
}
