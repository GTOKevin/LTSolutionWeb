import { Box, Button, CircularProgress, Tab, Tabs, Typography } from '@mui/material';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
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

export function MisViajeDetailPageContent({ controller }: MisViajeDetailPageContentProps) {
    const { viaje, isLoading } = controller;

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress />
            </Box>
        );
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
            <MisViajeDetailHeader viaje={viaje} onBack={controller.handleBack} />

            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                <Tabs
                    value={controller.currentTab}
                    onChange={controller.handleTabChange}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{ minHeight: 48, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minWidth: 'auto', px: 3, py: 1.5 } }}
                >
                    <Tab label="Resumen" />
                    <Tab label="Estado" />
                    <Tab label="Incidentes" />
                    <Tab label="Guías" />
                    <Tab label="Permisos" />
                    <Tab label="KMs" />
                </Tabs>
            </Box>

            <Box sx={{ flex: 1, bgcolor: 'background.paper', p: { xs: 2, md: 4 } }}>
                {controller.currentTab === 0 ? <MisViajeResumenSection viaje={viaje} /> : null}
                {controller.isStatusTabActive ? <MisViajeStatusSection controller={controller} /> : null}
                {controller.isIncidentesTabActive ? <MisViajeIncidentesSection controller={controller} /> : null}
                {controller.isGuiasTabActive ? <MisViajeGuiasSection controller={controller} /> : null}
                {controller.isPermisosTabActive ? <MisViajePermisosSection controller={controller} /> : null}
                {controller.isKmsTabActive ? <MisViajeKmsSection controller={controller} /> : null}
            </Box>
        </Box>
    );
}
