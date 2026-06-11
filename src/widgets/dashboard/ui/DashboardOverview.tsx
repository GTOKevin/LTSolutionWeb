import {
    Alert,
    Box,
    Button,
} from '@mui/material';
import type { DashboardOverview as DashboardOverviewData, DashboardPeriod } from '@entities/dashboard/model/types';
import { PERMISSIONS } from '@shared/constants/permissions';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { DASHBOARD_PERIOD_OPTIONS } from '@features/dashboard/lib/dashboard-helpers';
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
    onRetry: () => void;
}

export function DashboardOverview({
    data,
    period,
    onPeriodChange,
    isLoading,
    isFetching,
    isError,
    onRetry,
}: DashboardOverviewProps) {
    const canViewViajes = usePermission(PERMISSIONS.VIAJES.VER);
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
            <DashboardKpisSection data={data} />
            <DashboardChartsSection
                data={data}
                period={period}
                onPeriodChange={onPeriodChange}
                description={currentPeriodMeta.description}
            />
            <DashboardBottomSection
                data={data}
                canViewViajes={canViewViajes}
            />
        </Box>
    );
}
