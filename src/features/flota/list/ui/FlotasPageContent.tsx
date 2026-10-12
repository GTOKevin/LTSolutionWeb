import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Menu,
    MenuItem,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    FileDownload as ExportIcon,
    GridOn as ExcelIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingModal } from '@shared/components/ui/LoadingModal';
import { FlotaKpiStrip } from './FlotaKpiStrip';
import { FlotaTabs } from './FlotaTabs';
import { FlotaFilters } from './FlotaFilters';
import { FlotaCardsView } from './FlotaCardsView';
import { FlotaMobileList } from './FlotaMobileList';
import { FlotaTable } from './FlotaTable';
import { FlotaDrawerContent } from '../../detail/ui/FlotaDrawerContent';
import type { useFlotasPageController } from '../hooks/useFlotasPageController';
import type { FlotaReportFormat } from '@entities/flota/api/flota.api';

interface FlotasPageContentProps {
    controller: ReturnType<typeof useFlotasPageController>;
}

export function FlotasPageContent({ controller }: FlotasPageContentProps) {
    const theme = useTheme();
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

    const handleExportSelect = (format: FlotaReportFormat) => {
        setExportAnchorEl(null);
        controller.handleExportInventario(format);
    };

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
                p: { xs: 2, md: 3 },
                position: 'relative',
                pb: { xs: 10, md: 3 },
            }}
        >
            <Box
                sx={{
                    maxWidth: 1600,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, md: 3 },
                    minHeight: '100%',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                        flexWrap: 'wrap',
                        flexShrink: 0,
                    }}
                >
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
                            Gestión de Flota y Unidades
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administre sus vehículos, su operación y documentación
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={<ExportIcon />}
                            onClick={(event) => setExportAnchorEl(event.currentTarget)}
                            sx={{ fontWeight: 'bold', borderRadius: 2 }}
                        >
                            Exportar Inventario
                        </Button>
                        <Menu
                            anchorEl={exportAnchorEl}
                            open={Boolean(exportAnchorEl)}
                            onClose={() => setExportAnchorEl(null)}
                        >
                            <MenuItem onClick={() => handleExportSelect('excel')}>
                                <ExcelIcon fontSize="small" color="success" sx={{ mr: 1.5 }} />
                                Excel (.xlsx)
                            </MenuItem>
                            <MenuItem onClick={() => handleExportSelect('pdf')}>
                                <PdfIcon fontSize="small" color="error" sx={{ mr: 1.5 }} />
                                PDF
                            </MenuItem>
                        </Menu>

                        {controller.canManageFlotas ? (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={controller.handleCreate}
                                sx={{
                                    boxShadow: 2,
                                    fontWeight: 'bold',
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: 2,
                                }}
                            >
                                Nuevo Vehículo
                            </Button>
                        ) : null}
                    </Box>
                </Box>

                <Box sx={{ flexShrink: 0 }}>
                    <FlotaKpiStrip resumen={controller.resumen} isLoading={controller.isResumenLoading} />
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        flexShrink: 0,
                    }}
                >
                    <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, px: 1 }}>
                        <FlotaTabs value={controller.tipoFlota} onChange={controller.handleTabChange} />
                    </Box>
                    <Box sx={{ p: 2 }}>
                        <FlotaFilters
                            searchTerm={controller.searchTerm}
                            onSearchChange={controller.handleSearchTermChange}
                            estadoOperativo={controller.estadoOperativo}
                            onEstadoOperativoChange={controller.handleEstadoOperativoChange}
                            estadoDocumental={controller.estadoDocumental}
                            onEstadoDocumentalChange={controller.handleEstadoDocumentalChange}
                            viewMode={controller.viewMode}
                            onViewModeChange={controller.handleViewModeChange}
                        />
                    </Box>
                </Paper>

                {controller.isError ? (
                    <Alert
                        severity="error"
                        action={(
                            <Button color="inherit" size="small" onClick={() => controller.refetch()}>
                                Reintentar
                            </Button>
                        )}
                    >
                        No se pudo cargar la lista de vehículos. Verifique la conexión con el backend e intente nuevamente.
                    </Alert>
                ) : null}

                {controller.viewMode === 'cards' ? (
                    <FlotaCardsView
                        data={controller.data}
                        isLoading={controller.isLoading}
                        page={controller.page}
                        rowsPerPage={controller.rowsPerPage}
                        onPageChange={controller.handleChangePage}
                        onRowsPerPageChange={controller.handleChangeRowsPerPage}
                        onView={controller.handleView}
                        onEdit={controller.canManageFlotas ? controller.handleEdit : undefined}
                        onDelete={controller.canManageFlotas ? controller.handleDeleteClick : undefined}
                        onScheduleWorkshop={controller.handleProgramarTaller}
                    />
                ) : (
                    <>
                        <FlotaTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.handleView}
                            onEdit={controller.canManageFlotas ? controller.handleEdit : undefined}
                            onDelete={controller.canManageFlotas ? controller.handleDeleteClick : undefined}
                            onScheduleWorkshop={controller.handleProgramarTaller}
                        />

                        <FlotaMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.handleView}
                            onEdit={controller.canManageFlotas ? controller.handleEdit : undefined}
                            onDelete={controller.canManageFlotas ? controller.handleDeleteClick : undefined}
                            onScheduleWorkshop={controller.handleProgramarTaller}
                        />
                    </>
                )}
            </Box>

            <ConfirmDialog
                open={controller.openDeleteDialog}
                title="Eliminar Vehículo"
                content={`¿Está seguro que desea eliminar el vehículo con placa ${controller.flotaToDelete?.placa}? Esta acción no se puede deshacer.`}
                onClose={() => controller.setOpenDeleteDialog(false)}
                onConfirm={controller.handleConfirmDelete}
                isLoading={controller.deleteMutation.isPending}
            />

            <FlotaDrawerContent drawer={controller.drawer} />

            <LoadingModal open={Boolean(controller.exportLoadingMessage)} message={controller.exportLoadingMessage ?? undefined} />
        </Box>
    );
}
