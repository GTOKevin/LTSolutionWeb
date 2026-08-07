import { formatDateCustom, formatDateTime, getCurrentDateISO, getCurrentTimeISO } from '@shared/utils/date-utils';

export const employeeViajeDetailStyles = {
    heroHeader: {
        backgroundColor: 'rgba(248, 249, 250, 0.8)',
        backdropFilter: 'blur(20px)',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 3,
        p: 3,
        boxShadow: 'none',
        border: '1px solid rgba(192, 199, 212, 0.5)',
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

function resolveDateOnlyUtcTime(value: string) {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return Date.UTC(year, month - 1, day);
}

export interface EmployeeViajePermisoStatus {
    label: string;
    color: 'success' | 'warning' | 'error';
}

export function resolveEmployeeViajePermisoStatus(fechaVencimiento?: string | null): EmployeeViajePermisoStatus {
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
