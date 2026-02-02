import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Snackbar,
    Alert,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { useState, useEffect } from 'react';
import { CreateEditFlotaModal } from '../../features/flota/create-edit/ui/CreateEditFlotaModal';
import { ConfirmDialog } from '../../shared/components/ui/ConfirmDialog';
import type { Flota } from '@entities/flota/model/types';
import { FlotaTable } from '../../features/flota/list/ui/FlotaTable';
import { FlotaMobileList } from '../../features/flota/list/ui/FlotaMobileList';

export function FlotasPage() {
    const theme = useTheme();
    const queryClient = useQueryClient();
    
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedFlota, setSelectedFlota] = useState<Flota | null>(null);
    const [viewOnly, setViewOnly] = useState(false);
    
    // Delete Dialog State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [flotaToDelete, setFlotaToDelete] = useState<Flota | null>(null);

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Queries
    const { data, isLoading } = useQuery({
        queryKey: ['flotas', page, rowsPerPage, debouncedSearch],
        queryFn: () => flotaApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: debouncedSearch || undefined
        })
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => flotaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flotas'] });
            setOpenDeleteDialog(false);
            setFlotaToDelete(null);
            setSnackbarMessage('Vehículo eliminado exitosamente');
            setSnackbarOpen(true);
        },
        onError: () => {
            setSnackbarMessage('Error al eliminar el vehículo');
            setSnackbarOpen(true);
        }
    });

    // Handlers
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        setSelectedFlota(null);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleEdit = (flota: Flota) => {
        setSelectedFlota(flota);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleView = (flota: Flota) => {
        setSelectedFlota(flota);
        setViewOnly(true);
        setOpenModal(true);
    };

    const handleDeleteClick = (flota: Flota) => {
        setFlotaToDelete(flota);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (flotaToDelete) {
            deleteMutation.mutate(flotaToDelete.flotaID);
        }
    };

    const handleSuccess = (_: number) => {
        setSnackbarMessage(selectedFlota ? 'Vehículo actualizado exitosamente' : 'Vehículo creado exitosamente');
        setSnackbarOpen(true);
        queryClient.invalidateQueries({ queryKey: ['flotas'] });
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
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap'
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
                            Gestión de Flota
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administre sus vehículos y documentación
                        </Typography>
                    </Box>
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
                        Nuevo Vehículo
                    </Button>
                </Box>

                {/* Toolbar Section */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    bgcolor: theme.palette.background.paper, 
                    p: 2, 
                    borderRadius: 3,
                    boxShadow: theme.shadows[1],
                    border: `1px solid ${theme.palette.divider}`,
                    flexWrap: 'wrap'
                }}>
                    <Box sx={{ flex: 1, minWidth: '250px' }}>
                        <TextField
                            placeholder="Buscar por Placa, Marca o Modelo..."
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>
                </Box>

                {/* Main Content */}
                <FlotaTable
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onView={handleView}
                />

                <FlotaMobileList
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onView={handleView}
                />
            </Box>

            <CreateEditFlotaModal 
                open={openModal}
                onClose={() => setOpenModal(false)}
                flotaToEdit={selectedFlota}
                onSuccess={handleSuccess}
                viewOnly={viewOnly}
            />

            <ConfirmDialog
                open={openDeleteDialog}
                title="Eliminar Vehículo"
                content={`¿Está seguro que desea eliminar el vehículo con placa ${flotaToDelete?.placa}? Esta acción no se puede deshacer.`}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.includes('Error') ? 'error' : 'success'} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
