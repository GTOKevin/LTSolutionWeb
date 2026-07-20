import {
    Box,
    Button,
    Grid,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    CalendarMonth,
    NearMe,
    PictureAsPdf,
    TableView,
    TaskAlt,
    ViewKanban,
    ViewList,
} from '@mui/icons-material';
import { StatsCard } from '@shared/components/ui/StatsCard';
import type { ReactNode } from 'react';

interface ViajesOverviewShellProps {
    title: string;
    subtitle: string;
    canCreate?: boolean;
    onCreate?: () => void;
    agendados: string;
    enTransito: string;
    completados: string;
    filters: ReactNode;
    viewMode: 'table' | 'kanban';
    onViewModeChange: (mode: 'table' | 'kanban') => void;
    canExport?: boolean;
    onExportListPdf?: () => void;
    onExportListExcel?: () => void;
    children: ReactNode;
}

export function ViajesOverviewShell({
    title,
    subtitle,
    canCreate = false,
    onCreate,
    agendados,
    enTransito,
    completados,
    filters,
    viewMode,
    onViewModeChange,
    canExport = false,
    onExportListPdf,
    onExportListExcel,
    children,
}: ViajesOverviewShellProps) {
    const theme = useTheme();

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                </Box>

                {canCreate ? (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onCreate}
                            sx={{
                                boxShadow: theme.shadows[4],
                                fontWeight: 700,
                                px: 3,
                                py: 1.2,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '0.95rem',
                            }}
                        >
                            Nuevo Viaje
                        </Button>
                    </Box>
                ) : null}
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatsCard
                        title="Agendados"
                        value={agendados}
                        icon={<CalendarMonth sx={{ fontSize: 24 }} />}
                        caption="Estado actual"
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatsCard
                        title="En Tránsito"
                        value={enTransito}
                        icon={<NearMe sx={{ fontSize: 24 }} />}
                        caption="Estado actual"
                        color={theme.palette.warning.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatsCard
                        title="Completados"
                        value={completados}
                        icon={<TaskAlt sx={{ fontSize: 24 }} />}
                        caption="Estado actual"
                        color={theme.palette.success.main}
                    />
                </Grid>
            </Grid>

            {filters}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Box>
                    <Button
                        variant={viewMode === 'table' ? 'contained' : 'outlined'}
                        onClick={() => onViewModeChange('table')}
                        startIcon={<ViewList />}
                        size="small"
                        sx={{ mr: 1, borderRadius: 2, textTransform: 'none' }}
                    >
                        Tabla
                    </Button>
                    <Button
                        variant={viewMode === 'kanban' ? 'contained' : 'outlined'}
                        onClick={() => onViewModeChange('kanban')}
                        startIcon={<ViewKanban />}
                        size="small"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Kanban
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {canExport ? (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<PictureAsPdf />}
                                onClick={onExportListPdf}
                                color="error"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
                            >
                                Exportar PDF
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<TableView />}
                                onClick={onExportListExcel}
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600, borderRadius: 2, textTransform: 'none' }}
                            >
                                Exportar Excel
                            </Button>
                        </>
                    ) : null}
                </Box>
            </Box>

            {children}
        </Box>
    );
}
