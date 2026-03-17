import { useState } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Grid,
    useTheme
} from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import { ViajeGeneralPdf } from '@features/viaje/reports/ui/ViajeGeneralPdf';
import { ViajeGeneralExcelGenerator } from '@features/viaje/reports/lib/ViajeGeneralExcelGenerator';
import { ViajeListExcelGenerator } from '@features/viaje/reports/lib/ViajeListExcelGenerator';
import { ViajeListPdf } from '@features/viaje/reports/ui/ViajeListPdf';
import { 
    Add as AddIcon, 
    CalendarMonth, 
    NearMe, 
    TaskAlt,
    PictureAsPdf,
    TableView
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import { CreateEditViajeModal, ViajesFilters ,ViajesMobileList, ViajesTable} from '@/features/viaje/ui/Viaje/Index';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingModal } from '@shared/components/ui/LoadingModal';
import { StatsCard } from '@shared/components/ui/StatsCard';
import type { Viaje, ViajeListItem, ViajeFilters as ViajeFiltersType } from '@entities/viaje/model/types';
import { getFirstDayOfCurrentMonthISO, getLastDayOfCurrentMonthISO } from '@shared/utils/date-utils';
import { useToast } from '@/shared/components/ui/Toast';

export function ViajesPage() {
    const theme = useTheme();
    const { showToast } = useToast();
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

    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

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
        onError: () => {
            showToast({ entity: 'Viaje', action: 'delete', isError: true });
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
        onError: () => {
            showToast({ entity: 'Viaje', action: 'reopen', isError: true });
        }
    });

    const handleCreate = () => {
        setLoadingMessage("Mostrando nuevo viaje...");
        setTimeout(() => {
            setViajeToEdit(null);
            setIsViewOnly(false);
            setModalOpen(true);
            setLoadingMessage(null);
        }, 500);
    };

    const handleEdit = async (item: ViajeListItem) => {
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
    };

    const handleView = async (item: ViajeListItem) => {
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
    };

    const handleDelete = (item: ViajeListItem) => {
        setViajeToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleReopen = (item: ViajeListItem) => {
        setViajeToReopen(item);
        setReopenDialogOpen(true);
    };

    const handleExportListExcel = async () => {
        try {
            setLoadingMessage("Generando reporte Excel...");
            if (!filters.fechaInicio || !filters.fechaFin) {
                console.error("Fechas inválidas para reporte");
                return;
            }
            const reportData = await viajeApi.getReportList({
                fechaInicio: filters.fechaInicio,
                fechaFin: filters.fechaFin,
                clienteID: filters.clienteID,
                colaboradorID: filters.colaboradorID,
                tractoID: filters.tractoID,
                carretaID: filters.carretaID,
                search: filters.search
            });
            const generator = new ViajeListExcelGenerator(reportData, filters.fechaInicio, filters.fechaFin);
            await generator.generateAndDownload();
        } catch (error) {
            console.error("Error exporting Excel list:", error);
        } finally {
            setLoadingMessage(null);
        }
    };

    const handleExportListPdf = async () => {
        try {
            setLoadingMessage("Generando reporte PDF...");
             if (!filters.fechaInicio || !filters.fechaFin) {
                console.error("Fechas inválidas para reporte");
                return;
            }
            const reportData = await viajeApi.getReportList({
                fechaInicio: filters.fechaInicio,
                fechaFin: filters.fechaFin,
                clienteID: filters.clienteID,
                colaboradorID: filters.colaboradorID,
                tractoID: filters.tractoID,
                carretaID: filters.carretaID,
                search: filters.search
            });
            const blob = await pdf(<ViajeListPdf data={reportData} fechaInicio={filters.fechaInicio} fechaFin={filters.fechaFin} />).toBlob();
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_Viajes_${filters.fechaInicio}_${filters.fechaFin}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting PDF list:", error);
        } finally {
            setLoadingMessage(null);
        }
    };

    const handleExportExcel = async (item: ViajeListItem) => {
        try {
            setLoadingMessage("Generando reporte Excel...");
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const generator = new ViajeGeneralExcelGenerator(reportData);
            await generator.generateAndDownload();
        } catch (error) {
            console.error("Error exporting Excel:", error);
        } finally {
            setLoadingMessage(null);
        }
    };

    const handleExportPdf = async (item: ViajeListItem) => {
        try {
            setLoadingMessage("Generando reporte PDF...");
            const reportData = await viajeApi.getGeneralReportData(item.viajeID);
            const blob = await pdf(<ViajeGeneralPdf data={reportData} />).toBlob();
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Viaje_${item.viajeID}_General.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setLoadingMessage(null);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
                        variant="outlined" 
                        startIcon={<PictureAsPdf />}
                        onClick={handleExportListPdf}
                        color="error"
                        sx={{ 
                            fontWeight: 700, 
                            px: 3, 
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.95rem'
                        }}
                    >
                        PDF
                    </Button>
                    <Button 
                        variant="outlined" 
                        startIcon={<TableView />}
                        onClick={handleExportListExcel}
                        color="success"
                        sx={{ 
                            fontWeight: 700, 
                            px: 3, 
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.95rem'
                        }}
                    >
                        Excel
                    </Button>
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
