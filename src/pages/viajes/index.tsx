import { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    InputAdornment, 
    Paper, 
    Typography, 
    Grid, 
    MenuItem,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import { 
    Add as AddIcon, 
    Search as SearchIcon, 
    CalendarMonth, 
    NearMe, 
    TaskAlt,
    FilterList,
    CalendarToday
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { viajeApi } from '@entities/viaje/api/viaje.api';
import { ViajesTable } from '@features/viaje/list/ui/ViajesTable';
import { CreateEditViajeModal } from '@features/viaje/create-edit/ui/CreateEditViajeModal';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingModal } from '@shared/components/ui/LoadingModal';
import { StatsCard } from '@shared/components/ui/StatsCard';
import type { Viaje, ViajeListItem } from '@entities/viaje/model/types';

export function ViajesPage() {
    const theme = useTheme();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODOS');
    
    const [modalOpen, setModalOpen] = useState(false);
    const [viajeToEdit, setViajeToEdit] = useState<Viaje | null>(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [viajeToDelete, setViajeToDelete] = useState<ViajeListItem | null>(null);

    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['viajes', page, rowsPerPage, debouncedSearch, filterEstado],
        queryFn: () => viajeApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: debouncedSearch,
            estadoID: filterEstado !== 'TODOS' ? Number(filterEstado) : undefined
        })
    });

    const deleteMutation = useMutation({
        mutationFn: viajeApi.delete,
        onSuccess: () => {
            setDeleteDialogOpen(false);
            setViajeToDelete(null);
            refetch();
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
        if (item.estadoNombre?.toUpperCase() === 'COMPLETADO') {
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

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4}}>
                <Grid size={{xs:12, md:4}}>
                    <StatsCard
                        title="Agendados"
                        value="12"
                        icon={<CalendarMonth sx={{ fontSize: 24 }} />}
                        trend={0} 
                        color={theme.palette.info.main}
                    />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <StatsCard
                        title="En Tránsito"
                        value="08"
                        icon={<NearMe sx={{ fontSize: 24 }} />}
                        trend={5}
                        color={theme.palette.warning.main}
                    />
                </Grid>
                <Grid size={{xs:12, md:4}}>
                    <StatsCard
                        title="Completados"
                        value="45"
                        icon={<TaskAlt sx={{ fontSize: 24 }} />}
                        trend={12}
                        color={theme.palette.success.main}
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 2.5, 
                    mb: 3, 
                    borderRadius: 3, 
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignItems: 'flex-end'
                }}
            >
                <Box sx={{ flex: 1, minWidth: '240px' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                        Búsqueda Rápida
                    </Typography>
                    <TextField
                        placeholder="#ID, Cliente o Conductor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }
                        }}
                    />
                </Box>
                <Box sx={{ width: '200px' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                        Estado
                    </Typography>
                    <TextField
                        select
                        fullWidth
                        size="small"
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        InputProps={{ sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) } }}
                    >
                        <MenuItem value="TODOS">Todos los estados</MenuItem>
                        <MenuItem value="201">Agendado</MenuItem> {/* Assuming IDs from context or mocking */}
                        <MenuItem value="202">En Tránsito</MenuItem>
                        <MenuItem value="203">Completado</MenuItem>
                        <MenuItem value="204">Cancelado</MenuItem>
                    </TextField>
                </Box>
                <Box sx={{ width: '200px' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ ml: 1, mb: 0.5, display: 'block', textTransform: 'uppercase' }}>
                        Rango de Fechas
                    </Typography>
                    <TextField
                        placeholder="Hoy"
                        fullWidth
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }
                        }}
                    />
                </Box>
                <IconButton 
                    sx={{ 
                        bgcolor: alpha(theme.palette.text.secondary, 0.1), 
                        borderRadius: 2, 
                        p: 1,
                        height: 40,
                        width: 40
                    }}
                >
                    <FilterList />
                </IconButton>
            </Paper>

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

            <LoadingModal
                open={!!loadingMessage}
                message={loadingMessage || ''}
            />
        </Box>
    );
}
