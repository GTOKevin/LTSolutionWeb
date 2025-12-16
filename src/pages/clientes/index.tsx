import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Chip,
    IconButton,
    useTheme,
    alpha,
    Collapse,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Add as AddIcon,
    Tune as TuneIcon
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
    const [showFilters, setShowFilters] = useState(true);
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

    const handleSuccess = (id: number) => {
        refetch();
    };

    const handleChangePage = (event: unknown, newPage: number) => {
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
                
                {/* Desktop Toolbar */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Cartera de Clientes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestione la información, documentación y contactos de sus clientes.
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Filters */}
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{ 
                                bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.1) : 'background.paper',
                                color: showFilters ? 'primary.main' : 'text.primary',
                                borderColor: showFilters ? 'primary.main' : theme.palette.divider,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                        >
                            Filtros
                        </Button>

                        {/* Primary Action */}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{ boxShadow: 2 }}
                            onClick={handleCreate}
                        >
                            Nuevo Cliente
                        </Button>
                    </Box>
                </Box>

                {/* Mobile Toolbar */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                        <TextField
                            placeholder="Buscar cliente, ID o contacto..."
                            fullWidth
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ 
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    pr: 5 // Space for filter button
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end" sx={{ position: 'absolute', right: 8 }}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setShowFilters(!showFilters)}
                                            sx={{ color: showFilters ? 'primary.main' : 'text.secondary' }}
                                        >
                                            <TuneIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                    
                    <Collapse in={showFilters}>
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '::-webkit-scrollbar': { display: 'none' } }}>
                            <Chip 
                                label="Todos" 
                                size="small" 
                                color={statusFilter === ' ' ? 'primary' : 'default'} 
                                onClick={() => setStatusFilter(' ')}
                                sx={{ fontWeight: 500 }}
                            />
                            <Chip 
                                label="Habilitados" 
                                size="small" 
                                color={statusFilter === '1' ? 'primary' : 'default'}
                                variant={statusFilter === '1' ? 'filled' : 'outlined'}
                                onClick={() => setStatusFilter('1')}
                                sx={{ bgcolor: statusFilter === '1' ? undefined : 'background.paper', fontWeight: 500 }}
                            />
                            <Chip 
                                label="Inactivos" 
                                size="small" 
                                color={statusFilter === '0' ? 'primary' : 'default'}
                                variant={statusFilter === '0' ? 'filled' : 'outlined'}
                                onClick={() => setStatusFilter('0')}
                                sx={{ bgcolor: statusFilter === '0' ? undefined : 'background.paper', fontWeight: 500 }}
                            />
                        </Box>
                    </Collapse>
                </Box>

                {/* Mobile Content (Cards) */}
                <ClientesMobileList
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                {/* Desktop Content (Table) */}
                <ClientesTable
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    showFilters={showFilters}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onSearchChange={setSearchTerm}
                    onStatusFilterChange={setStatusFilter}
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
