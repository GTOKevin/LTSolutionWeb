import {
    AssignmentOutlined as AssignmentOutlinedIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
    FlagOutlined as FlagOutlinedIcon,
    ReportProblemOutlined as ReportProblemOutlinedIcon,
    RouteOutlined as RouteOutlinedIcon,
} from '@mui/icons-material';
import { Box, Button, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import type { ReactNode } from 'react';
import type { useMisViajeDetailPageController } from '../hooks/useMisViajeDetailPageController';
import { MisViajeDetailHeader } from './sections/MisViajeDetailHeader';
import { MisViajeGuiasSection } from './sections/MisViajeGuiasSection';
import { MisViajeIncidentesSection } from './sections/MisViajeIncidentesSection';
import { MisViajeKmsSection } from './sections/MisViajeKmsSection';
import { MisViajePermisosSection } from './sections/MisViajePermisosSection';
import { MisViajeResumenSection } from './sections/MisViajeResumenSection';
import { MisViajeStatusSection } from './sections/MisViajeStatusSection';

interface MisViajeDetailPageContentProps {
    controller: ReturnType<typeof useMisViajeDetailPageController>;
}

function buildTabLabel(label: string, icon: ReactNode, count?: number, highlight?: boolean) {
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: highlight ? 'primary.main' : 'text.secondary' }}>
                {icon}
            </Box>
            <span>{label}</span>
            {typeof count === 'number' ? (
                <Box
                    component="span"
                    sx={{
                        minWidth: 22,
                        height: 22,
                        px: 0.75,
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: highlight ? 'primary.main' : 'action.selected',
                        color: highlight ? 'primary.contrastText' : 'text.secondary',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                    }}
                >
                    {count}
                </Box>
            ) : null}
        </Box>
    );
}

function MisViajeDetailLoadingState() {
    return (
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
            <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
                <Skeleton variant="rounded" height={220} />
            </Box>
            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: 'divider' }}>
                <Skeleton variant="text" width={320} height={54} />
            </Box>
            <Box sx={{ p: { xs: 2, md: 4 }, display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, 1fr)' } }}>
                <Skeleton variant="rounded" height={260} sx={{ gridColumn: { xs: 'span 1', xl: 'span 5' } }} />
                <Skeleton variant="rounded" height={260} sx={{ gridColumn: { xs: 'span 1', xl: 'span 7' } }} />
            </Box>
        </Box>
    );
}

export function MisViajeDetailPageContent({ controller }: MisViajeDetailPageContentProps) {
    const { viaje, isLoading } = controller;

    if (isLoading) {
        return <MisViajeDetailLoadingState />;
    }

    if (controller.isError && !viaje) {
        return (
            <Box sx={{ p: 4 }}>
                <FetchErrorState
                    message="No se pudo cargar el viaje del portal del empleado."
                    onRetry={controller.retryViajeLoad}
                />
            </Box>
        );
    }

    if (!viaje) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">No se encontró el viaje</Typography>
                <Button onClick={controller.handleBack} sx={{ mt: 2 }}>
                    Volver
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
            <MisViajeDetailHeader controller={controller} />

            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Tabs
                    value={controller.currentTab}
                    onChange={controller.handleTabChange}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{
                        minHeight: 54,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            minWidth: 'auto',
                            px: 2.5,
                            py: 1.5,
                        },
                    }}
                >
                    <Tab label={buildTabLabel('Resumen', <AssignmentOutlinedIcon fontSize="small" />)} />
                    <Tab label={buildTabLabel('Estado', <FlagOutlinedIcon fontSize="small" />, undefined, Boolean(controller.nextEstado))} />
                    <Tab label={buildTabLabel('Incidentes', <ReportProblemOutlinedIcon fontSize="small" />, controller.incidentes.length)} />
                    <Tab label={buildTabLabel('Guías', <DescriptionOutlinedIcon fontSize="small" />, controller.guias.length)} />
                    <Tab label={buildTabLabel('Permisos', <AssignmentOutlinedIcon fontSize="small" />, controller.permisos.length)} />
                    <Tab label={buildTabLabel('KMs', <RouteOutlinedIcon fontSize="small" />, undefined, Boolean(viaje.kmInicio || viaje.kmLlegada || viaje.kmLlegadaBase))} />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, bgcolor: 'background.paper', p: { xs: 2, md: 4 } }}>
                {controller.currentTab === 0 ? <MisViajeResumenSection controller={controller} /> : null}
                {controller.isStatusTabActive ? <MisViajeStatusSection controller={controller} /> : null}
                {controller.isIncidentesTabActive ? <MisViajeIncidentesSection controller={controller} /> : null}
                {controller.isGuiasTabActive ? <MisViajeGuiasSection controller={controller} /> : null}
                {controller.isPermisosTabActive ? <MisViajePermisosSection controller={controller} /> : null}
                {controller.isKmsTabActive ? <MisViajeKmsSection controller={controller} /> : null}
            </Box>
        </Box>
    );
}
