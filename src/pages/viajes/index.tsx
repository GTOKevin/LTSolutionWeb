import { useState, useCallback } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Grid,
    useTheme
} from '@mui/material';
import { 
    Add as AddIcon, 
    CalendarMonth, 
    NearMe, 
    TaskAlt,
    PictureAsPdf,
    TableView
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import { CreateEditViajeModal, ViajesFilters ,ViajesMobileList, ViajesTable} from '@/features/viaje/ui/Viaje/Index';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingModal } from '@shared/components/ui/LoadingModal';
import { StatsCard } from '@shared/components/ui/StatsCard';
import type { Viaje, ViajeListItem, ViajeFilters as ViajeFiltersType } from '@entities/viaje/model/types';
import type { ApiError } from '@/shared/api/http';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';
import { useToast } from '@/shared/components/ui/Toast';
import { useViajeReports } from '@/features/viaje/hooks/useViajeReports';

export function ViajesPage() {
    const theme = useTheme();
    const { showToast } = useToast();
    const { 
        loadingMessage, 
        setLoadingMessage, 
        handleExportListExcel, 
        handleExportListPdf, 
        handleExportExcel, 
        handleExportPdf 
    } = useViajeReports();
    type ViajeMutationError = AxiosError<ApiError & { message?: string }>;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<ViajeFiltersType>({
        page: 1,
        size: 10,
        fechaInicio: getFirstDayOfCurrentMonthISO(),
        fechaFin: getLastDayOfCurrentMonthISO()
    });
    
    const [modalOpen, setModalOpen] = useState(false);
    const [viajeToEdit, setViajeToEdit] = useState<Viaje | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viajeToDelete, setViajeToDelete] = useState<ViajeListItem | null>(null);

    const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
    const [viajeToReopen, setViajeToReopen] = useState<ViajeListItem | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['viajes', page, rowsPerPage, filters],
        queryFn: () => viajeApi.getAll({
            ...filters,
            page: page + 1,
            size: rowsPerPage
        })
    });

    const deleteMutation = useMutation({
        mutationFn: viajeApi.delete,
        onSuccess: () => {
            setDeleteDialogOpen(false);
            setViajeToDelete(null);
            refetch();
            showToast({ entity: 'Viaje', action: 'delete' });
        },
        onError: (error: ViajeMutationError) => {
            const message = error.response?.data?.message || error.response?.data?.detail;
            showToast({ entity: 'Viaje', action: 'delete', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });

    const reopenMutation = useMutation({
        mutationFn: viajeApi.reopen,
        onSuccess: () => {
            setReopenDialogOpen(false);
            setViajeToReopen(null);
            refetch();
            showToast({ entity: 'Viaje', action: 'reopen' });
        },
        onError: (error: ViajeMutationError) => {
            const message = error.response?.data?.message || error.response?.data?.detail;
            showToast({ entity: 'Viaje', action: 'reopen', isError: true, message });
            if (message) console.error("Validation error:", message);
        }
    });

    const handleCreate = useCallback(() => {
        setLoadingMessage(null);
        setViajeToEdit(null);
        setIsViewOnly(false);
        setModalOpen(true);
    }, [setLoadingMessage]);

    const handleView = useCallback(async (item: ViajeListItem) => {
        try {
            setLoadingMessage("Obteniendo viaje...");
            const fullViaje = await viajeApi.getById(item.viajeID);
            setViajeToEdit(fullViaje);
            setIsViewOnly(true);
            setModalOpen(true);
        } catch (error) {
            console.error("Error fetching viaje details:", error);
        } finally {
            setLoadingMessage(null);
        }
    }, [setLoadingMessage]);

    const handleEdit = useCallback(async (item: ViajeListItem) => {
        if (item.cerrado) {
            handleView(item);
            return;
        }

        try {
            setLoadingMessage("Obteniendo viaje...");
            const fullViaje = await viajeApi.getById(item.viajeID);
            setViajeToEdit(fullViaje);
            setIsViewOnly(false);
            setModalOpen(true);
        } catch (error) {
            console.error("Error fetching viaje details:", error);
        } finally {
            setLoadingMessage(null);
        }
    }, [handleView, setLoadingMessage]);

    const handleDelete = useCallback((item: ViajeListItem) => {
        setViajeToDelete(item);
        setDeleteDialogOpen(true);
    }, []);

    const handleReopen = useCallback((item: ViajeListItem) => {
        setViajeToReopen(item);
        setReopenDialogOpen(true);
    }, []);

    const handleChangePage = useCallback((_: unknown, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const onExportListExcel = useCallback(() => handleExportListExcel(filters), [filters, handleExportListExcel]);
    const onExportListPdf = useCallback(() => handleExportListPdf(filters), [filters, handleExportListPdf]);

    return (
        <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 4
            }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                        Gestión de Viajes
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Monitoreo y administración eficiente de la flota y rutas activas en tiempo real.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{ 
                            boxShadow: theme.shadows[4],
                            fontWeight: 700, 
                            px: 3, 
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.95rem'
                        }}
                    >
                        Nuevo Viaje
                    </Button>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4}}>
                <Grid size={{xs:12, md:4}}>
                    <StatsCard
                        title="Agendados"
                        value={data?.totalAgendados?.toString() || "0"}
                        icon={<CalendarMonth sx={{ fontSize: 24 }} />}
                        trend={0} 
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <StatsCard
                        title="En Tránsito"
                        value={data?.totalEnTransito?.toString() || "0"}
                        icon={<NearMe sx={{ fontSize: 24 }} />}
                        trend={0}
                        color={theme.palette.warning.main}
                    />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <StatsCard
                        title="Completados"
                        value={data?.totalCompletados?.toString() || "0"}
                        icon={<TaskAlt sx={{ fontSize: 24 }} />}
                        trend={0}
                        color={theme.palette.success.main}
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <ViajesFilters onSearch={setFilters} />

            {/* Actions & Export (Above Table) */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center',
                gap: 2,
                mb: 2 
            }}>
                <Button 
                    variant="outlined" 
                    startIcon={<PictureAsPdf />}
                    onClick={onExportListPdf}
                    color="error"
                    size="small"
                    sx={{ 
                        fontWeight: 600, 
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Exportar
                </Button>
                <Button 
                    variant="outlined" 
                    startIcon={<TableView />}
                    onClick={onExportListExcel}
                    color="success"
                    size="small"
                    sx={{ 
                        fontWeight: 600, 
                        borderRadius: 2,
                        textTransform: 'none'
                    }}
                >
                    Exportar
                </Button>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <ViajesTable 
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    onExportExcel={handleExportExcel}
                    onExportPdf={handleExportPdf}
                    onReopen={handleReopen}
                />
            </Box>
            <ViajesMobileList
                data={data}
                isLoading={isLoading}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                onReopen={handleReopen}
            />

            <CreateEditViajeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                viaje={viajeToEdit}
                isViewOnly={isViewOnly}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                title="Eliminar Viaje"
                content={`¿Estás seguro de que deseas eliminar el viaje #${viajeToDelete?.viajeID}?`}
                onConfirm={() => viajeToDelete && deleteMutation.mutate(viajeToDelete.viajeID)}
                onClose={() => setDeleteDialogOpen(false)}
            />

            <ConfirmDialog
                open={reopenDialogOpen}
                title="Reabrir Viaje"
                content={`¿Estás seguro de que deseas reabrir el viaje #${viajeToReopen?.viajeID}? Esto habilitará la edición nuevamente.`}
                onConfirm={() => viajeToReopen && reopenMutation.mutate(viajeToReopen.viajeID)}
                onClose={() => setReopenDialogOpen(false)}
                isLoading={reopenMutation.isPending}
            />

            <LoadingModal
                open={!!loadingMessage}
                message={loadingMessage || ''}
            />
        </Box>
    );
}
