import {
    Alert,
    Box,
    Button,
} from '@mui/material';
import type {
    DashboardOverview as DashboardOverviewData,
    DashboardPeriod,
    DashboardTripStatusIds,
} from '@entities/dashboard/model/types';
import { DASHBOARD_PERIOD_OPTIONS } from '../lib/dashboard-view-helpers';
import { DashboardChartsSection } from './DashboardChartsSection';
import { DashboardBottomSection } from './DashboardBottomSection';
import { DashboardKpisSection } from './DashboardKpisSection';
import { DashboardOverviewHeader } from './DashboardOverviewHeader';
import { DashboardOverviewSkeleton } from './DashboardOverviewSkeleton';

interface DashboardOverviewProps {
    data?: DashboardOverviewData;
    period: DashboardPeriod;
    onPeriodChange: (period: DashboardPeriod) => void;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    permissions: {
        canViewViajes: boolean;
        canViewFacturas: boolean;
        canViewFlota: boolean;
        canViewColaboradores: boolean;
        canViewMantenimientos: boolean;
        canViewClientes: boolean;
        canViewUsuarios: boolean;
        canViewSecurityAlerts: boolean;
    };
    viajeStatusIds: DashboardTripStatusIds;
    onRetry: () => void;
}

export function DashboardOverview({
    data,
    period,
    onPeriodChange,
    isLoading,
    isFetching,
    isError,
    permissions,
    viajeStatusIds,
    onRetry,
}: DashboardOverviewProps) {
    const {
        canViewViajes,
        canViewFacturas,
        canViewFlota,
        canViewColaboradores,
        canViewMantenimientos,
        canViewClientes,
        canViewUsuarios,
        canViewSecurityAlerts,
    } = permissions;
    const hasVisibleDashboardSections =
        canViewViajes || canViewFacturas || canViewFlota || canViewSecurityAlerts;
    const currentPeriodMeta = DASHBOARD_PERIOD_OPTIONS.find(item => item.value === period) ?? DASHBOARD_PERIOD_OPTIONS[1];

    if (isError) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={onRetry}>
                            Reintentar
                        </Button>
                    }
                    sx={{ borderRadius: 3 }}
                >
                    No se pudo cargar la información del dashboard.
                </Alert>
            </Box>
        );
    }

    if (isLoading && !data) {
        return <DashboardOverviewSkeleton />;
    }

    if (!data) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    No hay información disponible para mostrar en el dashboard.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <DashboardOverviewHeader
                description={currentPeriodMeta.description}
                isFetching={isFetching}
                onRetry={onRetry}
            />
            {hasVisibleDashboardSections ? (
                <>
                    <DashboardKpisSection
                        data={data}
                        canViewViajes={canViewViajes}
                        canViewFacturas={canViewFacturas}
                        canViewSecurityAlerts={canViewSecurityAlerts}
                        canViewFlota={canViewFlota}
                        canViewColaboradores={canViewColaboradores}
                    />
                    <DashboardChartsSection
                        data={data}
                        period={period}
                        onPeriodChange={onPeriodChange}
                        description={currentPeriodMeta.description}
                        canViewViajes={canViewViajes}
                        canViewFacturas={canViewFacturas}
                    />
                    <DashboardBottomSection
                        data={data}
                        canViewViajes={canViewViajes}
                        canViewFacturas={canViewFacturas}
                        canViewSecurityAlerts={canViewSecurityAlerts}
                        canViewFlota={canViewFlota}
                        canViewColaboradores={canViewColaboradores}
                        canViewMantenimientos={canViewMantenimientos}
                        canViewClientes={canViewClientes}
                        canViewUsuarios={canViewUsuarios}
                        viajeStatusIds={viajeStatusIds}
                    />
                </>
            ) : (
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    No tienes permisos de módulo suficientes para visualizar secciones del dashboard.
                </Alert>
            )}
        </Box>
    );
}
