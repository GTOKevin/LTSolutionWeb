import {
    Box,
    Typography,
    Button,
    useTheme,
    Snackbar,
    Alert,
    TextField,
    InputAdornment,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { tipoMaestroApi } from '@entities/tipo-maestro/api/tipo-maestro.api';
import { useState, useEffect } from 'react';
import { CreateEditTipoMaestroModal } from '../../features/tipo-maestro/create-edit/ui/CreateEditTipoMaestroModal';
import type { TipoMaestro } from '@entities/tipo-maestro/model/types';
import { TipoMaestroTable } from '../../features/tipo-maestro/list/ui/TipoMaestroTable';
import { TipoMaestroMobileList } from '../../features/tipo-maestro/list/ui/TipoMaestroMobileList';

export function MaestrosPage() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeccion, setSelectedSeccion] = useState<string | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [maestroToEdit, setMaestroToEdit] = useState<TipoMaestro | null>(null);
    
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when section filter changes
    useEffect(() => {
        setPage(0);
    }, [selectedSeccion]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['tipo-maestros', page, rowsPerPage, debouncedSearch, selectedSeccion],
        queryFn: () => tipoMaestroApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch,
            seccion: selectedSeccion || undefined
        })
    });

    const { data: secciones } = useQuery({
        queryKey: ['secciones-maestro'],
        queryFn: tipoMaestroApi.getSecciones
    });

    const handleCreate = () => {
        setMaestroToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (maestro: TipoMaestro) => {
        setMaestroToEdit(maestro);
        setModalOpen(true);
    };

    const handleSuccess = (id: number) => {
        setSnackbarMessage(maestroToEdit ? 'Maestro actualizado exitosamente.' : 'Maestro creado exitosamente.');
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
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 3,
            p: { xs: 2, md: 3 },
            // Removed overflow/flex/height constraints to let AppLayout handle scroll
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                        Gestión de Maestros
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Administra las tablas maestras y configuraciones del sistema
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
                    Nuevo Maestro
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
                        placeholder="Buscar por Nombre o Código..."
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
                
                <Box sx={{ minWidth: '250px' }}>
                    <Autocomplete
                        options={secciones?.data || []}
                        value={selectedSeccion}
                        onChange={(_, newValue) => setSelectedSeccion(newValue)}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                placeholder="Filtrar por Sección" 
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <FilterIcon color="action" fontSize="small" />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        )}
                    />
                </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                borderRadius: 3, 
                flex: 1,
                minHeight: 0
            }}>
                {/* Desktop Table */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, minHeight: 0, flexDirection: 'column' }}>
                    <TipoMaestroTable
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
                    <TipoMaestroMobileList
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

            <CreateEditTipoMaestroModal 
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                maestroToEdit={maestroToEdit}
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
        </Box>
    );
}
