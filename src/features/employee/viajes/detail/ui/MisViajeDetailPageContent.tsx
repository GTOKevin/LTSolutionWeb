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
import type {
    MisViajeTabDescriptor,
    MisViajeTabKey,
    useMisViajeDetailPageController,
} from '../hooks/useMisViajeDetailPageController';
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

const TAB_ICONS: Record<MisViajeTabKey, ReactNode> = {
    resumen: <AssignmentOutlinedIcon fontSize="small" />,
    estado: <FlagOutlinedIcon fontSize="small" />,
    incidentes: <ReportProblemOutlinedIcon fontSize="small" />,
    guias: <DescriptionOutlinedIcon fontSize="small" />,
    permisos: <AssignmentOutlinedIcon fontSize="small" />,
    kms: <RouteOutlinedIcon fontSize="small" />,
};

// Armado visual de labels: el controller expone datos planos (key/label/count/highlight)
// y esta capa de presentacion es la unica responsable del render (iconos, badges, colores).
function buildTabLabel(tab: MisViajeTabDescriptor) {
    const { highlight } = tab;
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: highlight ? 'primary.main' : 'text.secondary' }}>
                {TAB_ICONS[tab.key]}
            </Box>
            <span>{tab.label}</span>
            {typeof tab.count === 'number' ? (
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
                    {tab.count}
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

    const activeTabKey = controller.activeVisibleTabKey;

    return (
        <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
            <MisViajeDetailHeader controller={controller} />

            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Tabs
                    value={controller.currentTabIndex}
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
                    {controller.tabs.map((tab) => (
                        <Tab key={tab.key} label={buildTabLabel(tab)} />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, bgcolor: 'background.paper', p: { xs: 2, md: 4 } }}>
                {activeTabKey === 'resumen' ? <MisViajeResumenSection controller={controller} /> : null}
                {activeTabKey === 'estado' ? <MisViajeStatusSection controller={controller} /> : null}
                {activeTabKey === 'incidentes' ? <MisViajeIncidentesSection controller={controller} /> : null}
                {activeTabKey === 'guias' ? <MisViajeGuiasSection controller={controller} /> : null}
                {activeTabKey === 'permisos' ? <MisViajePermisosSection controller={controller} /> : null}
                {activeTabKey === 'kms' ? <MisViajeKmsSection controller={controller} /> : null}
            </Box>
        </Box>
    );
}
