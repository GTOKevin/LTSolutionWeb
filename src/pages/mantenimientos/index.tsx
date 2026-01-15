import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    Grid,
    TextField,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    Build as BuildIcon,
    FilterAltOff as ClearFiltersIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mantenimientoApi } from '@entities/mantenimiento/api/mantenimiento.api';
import type { Mantenimiento } from '@entities/mantenimiento/model/types';
import { MantenimientoTable } from '@features/mantenimiento/list/ui/MantenimientoTable';
import { MantenimientoMobileList } from '@features/mantenimiento/list/ui/MantenimientoMobileList';
import { CreateEditMantenimientoModal } from '@features/mantenimiento/create-edit/ui/CreateEditMantenimientoModal';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { flotaApi } from '@entities/flota/api/flota.api';
import { estadoApi } from '@shared/api/estado.api';
import { TIPO_ESTADO } from '@/shared/constants/constantes';

export function MantenimientosPage() {
    const theme = useTheme();
    const queryClient = useQueryClient();
    
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(true);
    
    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        flotaID: 0,
        estadoID: 0,
        tipoServicioID: 0,
        desde: '',
        hasta: ''
    });
    
    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Mantenimiento | null>(null);
    const [viewOnly, setViewOnly] = useState(false);
    
    // Delete Dialog State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Mantenimiento | null>(null);

    // Catalog Queries for Filters
    const { data: flotas } = useQuery({ queryKey: ['flotas-select'], queryFn: () => flotaApi.getSelect() });
    const { data: estados } = useQuery({ queryKey: ['estados-select'], queryFn: () => estadoApi.getSelect(undefined,undefined,TIPO_ESTADO.MANTENIMIENTO) });

    const listaFlotas = flotas?.data || [];
    const listaEstados = estados?.data || [];

    // Main Query
    const { data, isLoading } = useQuery({
        queryKey: ['mantenimientos', page, rowsPerPage, filters],
        queryFn: () => mantenimientoApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: filters.search || undefined,
            flotaID: filters.flotaID || undefined,
            estadoID: filters.estadoID || undefined,
            tipoServicioID: filters.tipoServicioID || undefined,
            desde: filters.desde || undefined,
            hasta: filters.hasta || undefined
        })
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => mantenimientoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mantenimientos'] });
            setOpenDeleteDialog(false);
            setItemToDelete(null);
        }
    });

    // Handlers
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (field: string, value: any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            flotaID: 0,
            estadoID: 0,
            tipoServicioID: 0,
            desde: '',
            hasta: ''
        });
        setPage(0);
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleEdit = (item: Mantenimiento) => {
        setSelectedItem(item);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleView = (item: Mantenimiento) => {
        setSelectedItem(item);
        setViewOnly(true);
        setOpenModal(true);
    };

    const handleDeleteClick = (item: Mantenimiento) => {
        setItemToDelete(item);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.mantenimientoID);
        }
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
                {/* Header */}
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
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['mantenimientos'] })}
                                sx={{ border: `1px solid ${theme.palette.divider}` }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreate}
                            sx={{ px: 3 }}
                        >
                            Nuevo Registro
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                {showFilters && (
                    <Box sx={{ 
                        p: 2, 
                        bgcolor: 'background.paper', 
                        borderRadius: 2, 
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1]
                    }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{xs:12, md:3}}>
                                <TextField
                                    placeholder="Buscar por ID, vehículo..."
                                    size="small"
                                    fullWidth
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                            </Grid>
                            <Grid size={{xs:12, md:2}}>
                                <TextField
                                    select
                                    label="Vehículo"
                                    size="small"
                                    fullWidth
                                    value={filters.flotaID}
                                    onChange={(e) => handleFilterChange('flotaID', e.target.value)}
                                >
                                    <MenuItem value={0}>Todos</MenuItem>
                                    {listaFlotas.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>{item.text}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{xs:12, md:2}}>
                                <TextField
                                    select
                                    label="Estado"
                                    size="small"
                                    fullWidth
                                    value={filters.estadoID}
                                    onChange={(e) => handleFilterChange('estadoID', e.target.value)}
                                >
                                    <MenuItem value={0}>Todos</MenuItem>
                                    {listaEstados.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>{item.text}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{xs:12, md:2}}>
                                <TextField
                                    label="Desde"
                                    type="date"
                                    size="small"
                                    fullWidth
                                    value={filters.desde}
                                    onChange={(e) => handleFilterChange('desde', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{xs:12, md:2}}>
                                <TextField
                                    label="Hasta"
                                    type="date"
                                    size="small"
                                    fullWidth
                                    value={filters.hasta}
                                    onChange={(e) => handleFilterChange('hasta', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{xs:12, md:1}}>
                                <Tooltip title="Limpiar Filtros">
                                    <IconButton onClick={clearFilters}>
                                        <ClearFiltersIcon />
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Content */}
                <MantenimientoMobileList
                    data={data?.items}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                <MantenimientoTable
                    data={data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                {/* Modals */}
                <CreateEditMantenimientoModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    mantenimientoToEdit={selectedItem}
                    onSuccess={() => {
                        // Refresh handled by modal mutation success
                    }}
                    viewOnly={viewOnly}
                />

                <ConfirmDialog
                    open={openDeleteDialog}
                    title="Eliminar Registro"
                    content={`¿Está seguro que desea eliminar el mantenimiento #MNT-${itemToDelete?.mantenimientoID}? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => setOpenDeleteDialog(false)}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    severity="error"
                />
            </Box>
        </Box>
    );
}
