import { httpClient } from '@shared/api/http';
import type {
    DashboardEstadoFacturacion,
    DashboardNotification,
    DashboardOverview,
    DashboardOverviewParams,
    DashboardRecentTrip,
    DashboardViajesVolume,
    DashboardViajesVolumeParams,
    DashboardFacturacionStatusParams,
} from '../model/types';

export const DASHBOARD_QUERY_KEYS = {
    all: ['dashboard'] as const,
    overview: (params: DashboardOverviewParams) => [...DASHBOARD_QUERY_KEYS.all, 'overview', params] as const,
    securityAlerts: (limit: number) => [...DASHBOARD_QUERY_KEYS.all, 'security-alerts', limit] as const,
    facturacionStatus: (month?: string) => [...DASHBOARD_QUERY_KEYS.all, 'facturacion-status', month ?? 'current'] as const,
    viajesVolume: (params: DashboardViajesVolumeParams) => [...DASHBOARD_QUERY_KEYS.all, 'viajes-volume', params] as const,
    viajesRecientes: (limit: number) => [...DASHBOARD_QUERY_KEYS.all, 'viajes-recientes', limit] as const,
};

export const dashboardApi = {
    getOverview: async (params: DashboardOverviewParams = {}) => {
        const { data } = await httpClient.get<DashboardOverview>('/Dashboard/overview', { params });
        return data;
    },

    getSecurityAlerts: async (limit = 10) => {
        const { data } = await httpClient.get<DashboardNotification[]>('/Dashboard/security-alerts', {
            params: { limit },
        });
        return data;
    },

    getFacturacionStatus: async (params: DashboardFacturacionStatusParams = {}) => {
        const { data } = await httpClient.get<DashboardEstadoFacturacion>('/Dashboard/facturacion-status', {
            params,
        });
        return data;
    },

    getViajesVolume: async (params: DashboardViajesVolumeParams = {}) => {
        const { data } = await httpClient.get<DashboardViajesVolume>('/Dashboard/viajes-volume', {
            params,
        });
        return data;
    },

    getViajesRecientes: async (limit = 5) => {
        const { data } = await httpClient.get<DashboardRecentTrip[]>('/Dashboard/viajes-recientes', {
            params: { limit },
        });
        return data;
    },
};
