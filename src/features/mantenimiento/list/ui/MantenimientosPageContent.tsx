import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Add as AddIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Build as BuildIcon,
    FileDownload as FileDownloadIcon,
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MantenimientoFilter } from './MantenimientoFilter';
import { MantenimientoTable } from './MantenimientoTable';
import { MantenimientoMobileList } from './MantenimientoMobileList';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { APP_PATHS, buildAppCreatePath, buildAppDetailPath, buildAppViewPath } from '@shared/config/app-routes';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { useMantenimientoReport } from '../../hooks/useMantenimientoReport';
import { useMantenimientoPermissions } from '../../hooks/useMantenimientoPermissions';
import type { useMantenimientos } from '../hooks/useMantenimientos';

interface MantenimientosPageContentProps {
    controller: ReturnType<typeof useMantenimientos>;
}

export function MantenimientosPageContent({ controller }: MantenimientosPageContentProps) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { canManageMantenimientos, canViewMantenimientos } = useMantenimientoPermissions();
    const { generateSummaryExcel, generateSummaryPdf } = useMantenimientoReport();
    const [showFilters, setShowFilters] = useState(true);
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
    const openExportMenu = Boolean(exportAnchorEl);

    const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const currentParams = {
        search: controller.searchQuery || undefined,
        flotaID: controller.appliedFilters.flotaID || undefined,
        estadoID: controller.appliedFilters.estadoID || undefined,
        desde: controller.appliedFilters.desde || undefined,
        hasta: controller.appliedFilters.hasta || undefined
    };

    const handleExportExcel = () => {
        handleExportClose();
        generateSummaryExcel(currentParams);
    };

    const handleExportPdf = () => {
        handleExportClose();
        generateSummaryPdf(currentParams);
    };

    const handleCreate = () => {
        navigate(buildAppCreatePath(APP_PATHS.mantenimientos));
    };

    const handleEdit = (item: Mantenimiento) => {
        navigate(buildAppDetailPath(APP_PATHS.mantenimientos, item.mantenimientoID));
    };

    const handleView = (item: Mantenimiento) => {
        navigate(buildAppViewPath(APP_PATHS.mantenimientos, item.mantenimientoID));
    };

    return (
        <Box sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
            p: { xs: 2, md: 3 },
            position: 'relative',
            pb: { xs: 10, md: 3 }
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, height: '100%' }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                            display: 'flex'
                        }}>
                            <BuildIcon />
                        </Box>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                Mantenimientos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Gestión y control de servicios de flota
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Filtros">
                            <IconButton
                                onClick={() => setShowFilters(!showFilters)}
                                color={showFilters ? 'primary' : 'default'}
                                sx={{
                                    bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                <FilterListIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Recargar">
                            <IconButton
                                onClick={controller.handleRefresh}
                                sx={{ border: `1px solid ${theme.palette.divider}` }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>

                        {canViewMantenimientos && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<FileDownloadIcon />}
                                    onClick={handleExportClick}
                                    sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        color: 'text.primary',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Exportar
                                </Button>
                                <Menu
                                    anchorEl={exportAnchorEl}
                                    open={openExportMenu}
                                    onClose={handleExportClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                >
                                    <MenuItem onClick={handleExportExcel}>
                                        <ListItemIcon>
                                            <ExcelIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Excel (.xlsx)</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={handleExportPdf}>
                                        <ListItemIcon>
                                            <PdfIcon color="error" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>PDF (.pdf)</ListItemText>
                                    </MenuItem>
                                </Menu>

                            </>
                        )}

                        {canManageMantenimientos && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                                sx={{
                                    boxShadow: 2,
                                    fontWeight: 'bold',
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: 2
                                 }}
                            >
                                Nuevo Registro
                            </Button>
                        )}
                    </Box>
                </Box>

                {showFilters && (
                    <MantenimientoFilter
                        draftState={controller.draftState}
                        onDraftChange={controller.handleDraftChange}
                        onSearch={controller.handleSearch}
                        onClear={controller.handleClear}
                        flotas={controller.listaFlotas}
                        estados={controller.listaEstados}
                        isSearching={controller.isFetching}
                    />
                )}

                <MantenimientoMobileList
                    data={controller.data?.items}
                    total={controller.data?.total || 0}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    isLoading={controller.isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={controller.handleDeleteClick}
                    onReopen={controller.handleReopenClick}
                />

                <MantenimientoTable
                    data={controller.data}
                    isLoading={controller.isLoading}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={controller.handleDeleteClick}
                    onReopen={controller.handleReopenClick}
                />

                <ConfirmDialog
                    open={controller.openDeleteDialog}
                    title="Eliminar Registro"
                    content={`¿Está seguro que desea eliminar el mantenimiento #MNT-${controller.itemToDelete?.mantenimientoID}? Esta acción no se puede deshacer.`}
                    onConfirm={controller.handleConfirmDelete}
                    onClose={() => controller.setOpenDeleteDialog(false)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    severity="error"
                />

                <ConfirmDialog
                    open={controller.openReopenDialog}
                    title="Reabrir Mantenimiento"
                    content={`¿Está seguro que desea reabrir el mantenimiento #MNT-${controller.itemToReopen?.mantenimientoID}? Esto habilitará la edición nuevamente.`}
                    onConfirm={controller.handleConfirmReopen}
                    onClose={() => controller.setOpenReopenDialog(false)}
                    confirmText="Reabrir"
                    cancelText="Cancelar"
                    severity="warning"
                    isLoading={controller.reopenPending}
                />
            </Box>
        </Box>
    );
}
