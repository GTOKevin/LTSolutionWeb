import {
    Box,
    Typography,
    Button,
    useTheme,
    Snackbar,
    Alert,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { rolColaboradorApi } from '@entities/rol-colaborador/api/rol-colaborador.api';
import { useState, useEffect } from 'react';
import { CreateEditRolColaboradorModal } from '../../features/rol-colaborador/create-edit/ui/CreateEditRolColaboradorModal';
import type { RolColaborador } from '@entities/rol-colaborador/model/types';
import { RolColaboradorTable } from '../../features/rol-colaborador/list/ui/RolColaboradorTable';
import { RolColaboradorMobileList } from '../../features/rol-colaborador/list/ui/RolColaboradorMobileList';

export function RolesColaboradorPage() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [rolToEdit, setRolToEdit] = useState<RolColaborador | null>(null);
    
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['roles-colaborador', page, rowsPerPage, debouncedSearch],
        queryFn: () => rolColaboradorApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch
        })
    });

    const handleCreate = () => {
        setRolToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (rol: RolColaborador) => {
        setRolToEdit(rol);
        setModalOpen(true);
    };

    const handleSuccess = (id: number) => {
        setSnackbarMessage(rolToEdit ? 'Rol de colaborador actualizado exitosamente.' : 'Rol de colaborador creado exitosamente.');
        setSnackbarOpen(true);
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
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        Gestión de Roles de Colaborador
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra los roles específicos para los colaboradores
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1.2
                    }}
                >
                    Nuevo Rol
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
                border: `1px solid ${theme.palette.divider}`
            }}>
                <TextField
                    placeholder="Buscar por Nombre de Rol..."
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

            {/* Content Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: 3, 
                overflow: 'hidden'
            }}>
                {/* Desktop Table */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <RolColaboradorTable
                        data={data?.data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        onEdit={handleEdit}
                    />
                </Box>

                {/* Mobile List */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <RolColaboradorMobileList
                        data={data?.data}
                        isLoading={isLoading}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        onEdit={handleEdit}
                    />
                </Box>
            </Box>

            <CreateEditRolColaboradorModal 
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                rolToEdit={rolToEdit}
                onSuccess={handleSuccess}
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
