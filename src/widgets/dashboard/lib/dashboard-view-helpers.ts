import type {
    DashboardNotification,
    DashboardPeriod,
    DashboardRecentTrip,
} from '@entities/dashboard/model/types';
import { matchesCatalogCandidate } from '@entities/master-data/lib/catalog-utils';
import {
    isViajeAgendado,
    isViajeCompletado,
    isViajeDescargando,
    isViajeTransito,
} from '@entities/viaje/model/status';
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

const DASHBOARD_NOTIFICATION_MODULE_CANDIDATES = {
    facturas: ['factura', 'facturas'],
    viajes: ['viaje', 'viajes'],
    flota: ['flota', 'flotas', 'vehiculo', 'vehiculos'],
    colaboradores: ['colaborador', 'colaboradores', 'documento', 'documentos', 'licencia', 'licencias'],
    mantenimientos: ['mantenimiento', 'mantenimientos'],
    clientes: ['cliente', 'clientes'],
    usuarios: ['usuario', 'usuarios'],
} as const;

const DASHBOARD_NOTIFICATION_TONE_CANDIDATES = {
    critical: ['error', 'critico', 'critica', 'critical'],
    warning: ['warning', 'advertencia', 'mantenimiento'],
} as const;

function normalizeDashboardSearchText(value?: string | null) {
    return value
        ?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase() ?? '';
}

function notificationMatchesModuleText(notification: DashboardNotification, candidates: readonly string[]) {
    const searchableText = normalizeDashboardSearchText(
        [notification.urlAccion, notification.titulo, notification.mensaje].filter(Boolean).join(' '),
    );

    if (!searchableText) {
        return false;
    }

    return candidates.some((candidate) => searchableText.includes(normalizeDashboardSearchText(candidate)));
}

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

export function resolveDashboardNotificationModule(notification: DashboardNotification): DashboardNotificationModule {
    const normalizedUrl = normalizeNotificationActionUrl(notification.urlAccion);

    if (
        normalizedUrl?.startsWith(APP_PATHS.facturas) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.facturas)
    ) {
        return 'facturas';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.viajes) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.viajes)
    ) {
        return 'viajes';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.flotas) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.flota)
    ) {
        return 'flota';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.colaboradores) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.colaboradores)
    ) {
        return 'colaboradores';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.mantenimientos) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.mantenimientos)
    ) {
        return 'mantenimientos';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.clientes) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.clientes)
    ) {
        return 'clientes';
    }

    if (
        normalizedUrl?.startsWith(APP_PATHS.usuarios) ||
        notificationMatchesModuleText(notification, DASHBOARD_NOTIFICATION_MODULE_CANDIDATES.usuarios)
    ) {
        return 'usuarios';
    }

    return 'desconocido';
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
