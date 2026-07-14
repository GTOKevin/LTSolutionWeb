import type {
    DashboardNotification,
    DashboardPeriod,
    DashboardRecentTrip,
} from '@entities/dashboard/model/types';
import {
    isViajeAgendado,
    isViajeCompletado,
    isViajeDescargando,
    isViajeTransito,
} from '@entities/viaje/model/status';

export const DASHBOARD_PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string; description: string }> = [
    { value: 'day', label: 'Últimos 7 días', description: 'Actividad diaria reciente' },
    { value: 'week', label: 'Últimas 8 semanas', description: 'Actividad operativa semanal' },
    { value: 'month', label: 'Últimos 6 meses', description: 'Comportamiento mensual' },
];

export function formatTrendPercentage(value: number) {
    const rounded = Math.abs(value).toFixed(1);
    if (value > 0) return `+${rounded}% vs mes ant.`;
    if (value < 0) return `-${rounded}% vs mes ant.`;
    return '0.0% vs mes ant.';
}

export function getTrendDirection(value: number) {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
}

export function getTripStatusTone(trip: DashboardRecentTrip) {
    if (isViajeTransito({ estadoNombre: trip.estadoNombre }) || isViajeDescargando({ estadoNombre: trip.estadoNombre })) {
        return 'active';
    }

    if (isViajeAgendado({ estadoNombre: trip.estadoNombre })) {
        return 'scheduled';
    }

    if (isViajeCompletado({ estadoNombre: trip.estadoNombre })) {
        return 'completed';
    }

    return 'default';
}

export function normalizeDashboardActionUrl(url?: string) {
    if (!url) return null;
    if (url.startsWith('/app/')) return url;

    const cleaned = url.startsWith('/') ? url : `/${url}`;
    const segments = cleaned.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const [resource, id] = segments;

    switch (resource.toLowerCase()) {
        case 'viajes':
        case 'viaje':
            return id ? `/app/viajes/${id}` : '/app/viajes';
        case 'facturas':
        case 'factura':
            return id ? `/app/facturas/${id}` : '/app/facturas';
        case 'flotas':
        case 'flota':
            return id ? `/app/flotas/${id}/ver` : '/app/flotas';
        case 'colaboradores':
        case 'colaborador':
            return id ? `/app/colaboradores/${id}/ver` : '/app/colaboradores';
        case 'mantenimientos':
        case 'mantenimiento':
            return id ? `/app/mantenimientos/${id}/ver` : '/app/mantenimientos';
        case 'clientes':
        case 'cliente':
            return id ? `/app/clientes/${id}` : '/app/clientes';
        case 'usuarios':
        case 'usuario':
            return '/app/usuarios';
        default:
            return null;
    }
}

export function getNotificationTone(notification: DashboardNotification) {
    const lowerType = notification.tipoNotificacion.toLowerCase();
    const lowerTitle = notification.titulo.toLowerCase();

    if (lowerType.includes('error') || lowerTitle.includes('vencid') || lowerTitle.includes('alerta')) {
        return 'critical';
    }

    if (lowerType.includes('warning') || lowerTitle.includes('mantenimiento')) {
        return 'warning';
    }

    return 'info';
}
