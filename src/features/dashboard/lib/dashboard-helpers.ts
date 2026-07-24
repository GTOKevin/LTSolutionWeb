import type {
    DashboardNotification,
    DashboardPeriod,
    DashboardRecentTrip,
} from '@entities/dashboard/model/types';
import { APP_PATHS, buildAppViewPath } from '@app/router/model/navigation';
import {
    isViajeAgendado,
    isViajeCompletado,
    isViajeDescargando,
    isViajeTransito,
} from '@entities/viaje/model/status';

export const DASHBOARD_PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string; description: string }> = [
    { value: 'day', label: 'Vista diaria', description: 'Resumen operativo diario' },
    { value: 'week', label: 'Vista semanal', description: 'Resumen operativo semanal' },
    { value: 'month', label: 'Vista mensual', description: 'Resumen operativo mensual' },
];

export type DashboardNotificationModule =
    | 'viajes'
    | 'facturas'
    | 'flota'
    | 'colaboradores'
    | 'mantenimientos'
    | 'clientes'
    | 'usuarios'
    | 'desconocido';

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
    if (url.startsWith(APP_PATHS.appRoot)) return url;

    const cleaned = url.startsWith('/') ? url : `/${url}`;
    const segments = cleaned.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const [resource, id] = segments;

    switch (resource.toLowerCase()) {
        case 'viajes':
        case 'viaje':
            return id ? buildAppViewPath(APP_PATHS.viajes, id) : APP_PATHS.viajes;
        case 'facturas':
        case 'factura':
            return id ? buildAppViewPath(APP_PATHS.facturas, id) : APP_PATHS.facturas;
        case 'flotas':
        case 'flota':
            return id ? buildAppViewPath(APP_PATHS.flotas, id) : APP_PATHS.flotas;
        case 'colaboradores':
        case 'colaborador':
            return id ? buildAppViewPath(APP_PATHS.colaboradores, id) : APP_PATHS.colaboradores;
        case 'mantenimientos':
        case 'mantenimiento':
            return id ? buildAppViewPath(APP_PATHS.mantenimientos, id) : APP_PATHS.mantenimientos;
        case 'clientes':
        case 'cliente':
            return id ? buildAppViewPath(APP_PATHS.clientes, id) : APP_PATHS.clientes;
        case 'usuarios':
        case 'usuario':
            return APP_PATHS.usuarios;
        default:
            return null;
    }
}

export function resolveDashboardNotificationModule(notification: DashboardNotification): DashboardNotificationModule {
    const normalizedUrl = normalizeDashboardActionUrl(notification.urlAccion);
    const searchableText = `${notification.titulo} ${notification.mensaje} ${notification.tipoNotificacion}`.toLowerCase();

    if (normalizedUrl?.startsWith(APP_PATHS.facturas) || searchableText.includes('factura')) {
        return 'facturas';
    }

    if (normalizedUrl?.startsWith(APP_PATHS.viajes) || searchableText.includes('viaje')) {
        return 'viajes';
    }

    if (normalizedUrl?.startsWith(APP_PATHS.flotas) || searchableText.includes('flota') || searchableText.includes('vehicul')) {
        return 'flota';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.colaboradores) ||
        searchableText.includes('documento') ||
        searchableText.includes('licencia') ||
        searchableText.includes('colaborador')
    ) {
        return 'colaboradores';
    }

    if (normalizedUrl?.startsWith(APP_PATHS.mantenimientos) || searchableText.includes('mantenimiento')) {
        return 'mantenimientos';
    }

    if (normalizedUrl?.startsWith(APP_PATHS.clientes) || searchableText.includes('cliente')) {
        return 'clientes';
    }

    if (normalizedUrl?.startsWith(APP_PATHS.usuarios) || searchableText.includes('usuario')) {
        return 'usuarios';
    }

    return 'desconocido';
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
