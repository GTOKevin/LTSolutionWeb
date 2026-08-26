import { Box, Button, Paper, Stack, Tab, Tabs, Typography, useTheme, alpha } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import type { ReactNode, SyntheticEvent } from 'react';
import { VIAJE_STATUS_CODE } from '@entities/viaje/model/status';

interface ViajeEditShellTab {
    label: string;
    disabled?: boolean;
}

interface ViajeEditShellProps {
    viajeCodigo?: string | null;
    statusLabel?: string | null;
    statusCodigo?: string | null;
    headerActions?: ReactNode;
    activeTab: number;
    onTabChange: (_event: SyntheticEvent, value: number) => void;
    tabs: ViajeEditShellTab[];
    onBack: () => void;
    children: ReactNode;
}

export function ViajeEditShell({
    viajeCodigo,
    statusLabel,
    statusCodigo,
    headerActions,
    activeTab,
    onTabChange,
    tabs,
    onBack,
    children,
}: ViajeEditShellProps) {
    const theme = useTheme();

    const getEstadoConfig = (codigo?: string | null, nombre?: string | null) => {
        const label = nombre || 'Sin estado';
        const norm = (codigo || label).toLowerCase().trim();

        if (norm === 'age' || norm === 'agendado' || norm === 'programado' || codigo === VIAJE_STATUS_CODE.AGENDADO) {
            return {
                label,
                bg: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                borderColor: alpha(theme.palette.info.main, 0.25),
                dotColor: theme.palette.info.main,
            };
        }
        if (norm === 'tra' || norm === 'transito' || norm === 'tránsito' || norm === 'en ruta' || codigo === VIAJE_STATUS_CODE.TRANSITO) {
            return {
                label,
                bg: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.dark,
                borderColor: alpha(theme.palette.warning.main, 0.3),
                dotColor: theme.palette.warning.main,
            };
        }
        if (norm === 'desc' || norm === 'descargando' || norm === 'en descarga' || codigo === VIAJE_STATUS_CODE.DESCARGANDO) {
            return {
                label,
                bg: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                dotColor: theme.palette.secondary.main,
            };
        }
        if (norm === 'comp' || norm === 'completado' || codigo === VIAJE_STATUS_CODE.COMPLETADO) {
            return {
                label,
                bg: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.dark,
                borderColor: alpha(theme.palette.success.main, 0.3),
                dotColor: theme.palette.success.main,
            };
        }
        return {
            label,
            bg: alpha(theme.palette.text.secondary, 0.1),
            color: theme.palette.text.secondary,
            borderColor: alpha(theme.palette.divider, 0.8),
            dotColor: theme.palette.text.secondary,
        };
    };

    const estadoConfig = getEstadoConfig(statusCodigo, statusLabel);

    return (
        <Box sx={{ marginBottom: '24px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap" gap={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography
                        variant="h5"
                        fontWeight={800}
                        color="text.primary"
                        sx={{ letterSpacing: '-0.02em' }}
                    >
                        Edición de Viaje
                    </Typography>
                    {viajeCodigo && (
                        <Typography
                            component="span"
                            sx={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                px: 1.2,
                                py: 0.3,
                                borderRadius: 1.5,
                                letterSpacing: 0.5,
                            }}
                        >
                            {viajeCodigo}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    {headerActions}

                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bgcolor: estadoConfig.bg,
                            color: estadoConfig.color,
                            border: `1px solid ${estadoConfig.borderColor}`,
                            borderRadius: 10,
                            px: 1.5,
                            py: 0.6,
                            gap: 0.75,
                        }}
                    >
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: estadoConfig.dotColor }} />
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1 }}>
                            {estadoConfig.label}
                        </Typography>
                    </Box>

                    <Button
                        onClick={onBack}
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowBackIcon fontSize="small" />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'divider',
                            color: 'text.secondary',
                            '&:hover': {
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                            },
                        }}
                    >
                        Volver
                    </Button>
                </Box>
            </Stack>

            <Paper
                sx={{
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
                elevation={0}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1, bgcolor: 'background.paper' }}>
                    <Tabs
                        value={activeTab}
                        onChange={onTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            minHeight: 48,
                            '& .MuiTab-root': {
                                py: 1.75,
                                px: 3.5,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'text.secondary',
                                textTransform: 'none',
                                transition: 'color 0.2s ease',
                                '&:hover': {
                                    color: 'primary.main',
                                },
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                    fontWeight: 700,
                                },
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderTopLeftRadius: 3,
                                borderTopRightRadius: 3,
                            },
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab.label} label={tab.label} disabled={tab.disabled} />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: 3, minHeight: '60vh' }}>{children}</Box>
            </Paper>
        </Box>
    );
}
