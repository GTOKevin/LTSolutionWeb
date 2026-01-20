import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clienteApi } from '@entities/cliente/api/cliente.api';
import { useState, useEffect } from 'react';
import { CreateEditClienteModal } from '../../features/cliente/create-edit/ui/CreateEditClienteModal';
import { ConfirmDialog } from '../../shared/components/ui/ConfirmDialog';
import type { Cliente } from '@entities/cliente/model/types';
import { ClientesTable } from '../../features/cliente/list/ui/ClientesTable';
import { ClientesMobileList } from '../../features/cliente/list/ui/ClientesMobileList';

export function ClientesPage() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState(' ');
    const [modalOpen, setModalOpen] = useState(false);
    const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [viewOnlyMode, setViewOnlyMode] = useState(false);

    useEffect(() => {
        const handleOpenCreateModal = () => handleCreate();
        window.addEventListener('open-create-client-modal', handleOpenCreateModal);
        return () => window.removeEventListener('open-create-client-modal', handleOpenCreateModal);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0); // Reset page on new search
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['clientes', page, rowsPerPage, debouncedSearch, statusFilter],
        queryFn: () => clienteApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch,
            active: statusFilter === ' ' ? undefined : statusFilter
        })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => clienteApi.delete(id),
        onSuccess: () => {
            setDeleteConfirmOpen(false);
            setClienteToDelete(null);
            setSnackbarMessage(`Cliente ${clienteToDelete?.razonSocial} Eliminado.`);
            setSnackbarOpen(true);
            refetch();
        },
        onError: () => {
             setDeleteConfirmOpen(false);
             setClienteToDelete(null);
             // Optionally handle error message
        }
    });

    const handleCreate = () => {
        setClienteToEdit(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleEdit = (cliente: Cliente) => {
        setClienteToEdit(cliente);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleView = (cliente: Cliente) => {
        setClienteToEdit(cliente);
        setViewOnlyMode(true);
        setModalOpen(true);
    };

    const handleDeleteClick = (cliente: Cliente) => {
        setClienteToDelete(cliente);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (clienteToDelete) {
            deleteMutation.mutate(clienteToDelete.clienteID);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setClienteToEdit(null);
        setViewOnlyMode(false);
    };

    const handleSuccess = (_: number) => {
        refetch();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
            p: { xs: 2, md: 3 },
            position: 'relative',
            pb: { xs: 10, md: 3 } // Padding bottom for mobile nav
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
                            Cartera de Clientes
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestione la información, documentación y contactos de sus clientes.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ 
                            px: 3,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }}
                        onClick={handleCreate}
                    >
                        Nuevo Cliente
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
                            placeholder="Buscar por Razón Social o ID Fiscal..."
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
                    <Box sx={{ minWidth: '200px' }}>
                        <Select
                            size="small"
                            fullWidth
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value=" ">Todos los Estados</MenuItem>
                            <MenuItem value="1">Activo</MenuItem>
                            <MenuItem value="0">Inactivo</MenuItem>
                        </Select>
                    </Box>
                </Box>

                {/* Desktop Content (Table) */}
                <ClientesTable
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                {/* Mobile Content (Cards) */}
                <ClientesMobileList
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            </Box>

            <CreateEditClienteModal 
                open={modalOpen}
                onClose={handleCloseModal}
                clienteToEdit={clienteToEdit}
                onSuccess={handleSuccess}
                viewOnly={viewOnlyMode}
            />

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Eliminar Cliente"
                content={
                    <Typography>
                        ¿Está seguro de eliminar el cliente <strong>{clienteToDelete?.razonSocial}</strong> con RUC <strong>{clienteToDelete?.ruc}</strong>?
                    </Typography>
                }
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                severity="error"
                confirmText="Eliminar"
                isLoading={deleteMutation.isPending}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
