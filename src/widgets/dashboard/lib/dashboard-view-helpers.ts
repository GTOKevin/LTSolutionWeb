import type {
    DashboardNotification,
    DashboardPeriod,
} from '@entities/dashboard/model/types';
import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';
import { APP_PATHS } from '@shared/config/app-routes';
import { normalizeNotificationActionUrl } from '@shared/utils/notification-navigation';

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

const DASHBOARD_NOTIFICATION_TONE_CANDIDATES = {
    critical: ['error', 'critico', 'critica', 'critical'],
    warning: ['warning', 'advertencia', 'mantenimiento'],
} as const;

const DASHBOARD_NOTIFICATION_ROUTE_PREFIXES: Array<{
    module: DashboardNotificationModule;
    path: string;
}> = [
    { module: 'facturas', path: APP_PATHS.facturas },
    { module: 'viajes', path: APP_PATHS.viajes },
    { module: 'flota', path: APP_PATHS.flotas },
    { module: 'colaboradores', path: APP_PATHS.colaboradores },
    { module: 'mantenimientos', path: APP_PATHS.mantenimientos },
    { module: 'clientes', path: APP_PATHS.clientes },
    { module: 'usuarios', path: APP_PATHS.usuarios },
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

export interface DashboardTripStatusIds {
    agendadoId?: number;
    transitoId?: number;
    descargandoId?: number;
    completadoId?: number;
}

export function getTripStatusTone(estadoId: number | null | undefined, statusIds: DashboardTripStatusIds) {
    if (!estadoId) {
        return 'default';
    }

    if (estadoId === statusIds.transitoId || estadoId === statusIds.descargandoId) {
        return 'active';
    }

    if (estadoId === statusIds.agendadoId) {
        return 'scheduled';
    }

    if (estadoId === statusIds.completadoId) {
        return 'completed';
    }

    return 'default';
}

export function resolveDashboardNotificationAction(notification: DashboardNotification): {
    actionUrl: string | null;
    module: DashboardNotificationModule;
} {
    const normalizedUrl = normalizeNotificationActionUrl(notification.urlAccion);
    const matchedRoute = DASHBOARD_NOTIFICATION_ROUTE_PREFIXES.find(({ path }) =>
        normalizedUrl === path || normalizedUrl?.startsWith(`${path}/`)
    );

    return {
        actionUrl: normalizedUrl,
        module: matchedRoute?.module ?? 'desconocido',
    };
}

export function resolveDashboardNotificationModule(notification: DashboardNotification): DashboardNotificationModule {
    return resolveDashboardNotificationAction(notification).module;
}

export function getNotificationTone(notification: DashboardNotification) {
    if (matchesCatalogCandidate(notification.tipoNotificacion, DASHBOARD_NOTIFICATION_TONE_CANDIDATES.critical)) {
        return 'critical';
    }

    if (matchesCatalogCandidate(notification.tipoNotificacion, DASHBOARD_NOTIFICATION_TONE_CANDIDATES.warning)) {
        return 'warning';
    }

    return 'info';
}
