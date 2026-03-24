import {
    Box,
    Typography,
    Button,
    useTheme,
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
import { tipoProductoApi } from '@entities/tipo-producto/api/tipo-producto.api';
import { useState, useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { CreateEditTipoProductoModal } from '../../features/tipo-producto/create-edit/ui/CreateEditTipoProductoModal';
import type { TipoProducto } from '@entities/tipo-producto/model/types';
import { TipoProductoTable } from '../../features/tipo-producto/list/ui/TipoProductoTable';
import { TipoProductoMobileList } from '../../features/tipo-producto/list/ui/TipoProductoMobileList';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import { useDeleteTipoProducto } from '@/features/tipo-producto/hooks/useTipoProductoCrud';
import { useToast } from '@/shared/components/ui/Toast';

export function TipoProductoPage() {
    const theme = useTheme();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [tipoToEdit, setTipoToEdit] = useState<TipoProducto | null>(null);
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tipoToDelete, setTipoToDelete] = useState<TipoProducto | null>(null);

    const deleteMutation = useDeleteTipoProducto();

    useEffect(() => {
        setPageTitle('Tipos de Producto');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(0);
    }, [selectedCategoria]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['tipo-productos', page, rowsPerPage, debouncedSearch, selectedCategoria],
        queryFn: () => tipoProductoApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch,
            categoria: selectedCategoria || undefined
        })
    });

    const { data: categorias } = useQuery({
        queryKey: ['categorias-select'],
        queryFn: tipoProductoApi.getSelectCategoria
    });

    const handleCreate = () => {
        setTipoToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (tipo: TipoProducto) => {
        setTipoToEdit(tipo);
        setModalOpen(true);
    };

    const handleDeleteClick = (tipo: TipoProducto) => {
        setTipoToDelete(tipo);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!tipoToDelete) return;
        try {
            await deleteMutation.mutateAsync(tipoToDelete.tipoProductoID);
            showToast({ message: 'Tipo de producto eliminado exitosamente', severity: 'success' });
            setDeleteDialogOpen(false);
            setTipoToDelete(null);
            refetch();
        } catch (error: any) {
            showToast({ message: error.response?.data?.detail || 'Error al eliminar', severity: 'error' });
        }
    };

    const handleSuccess = () => {
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
            display: 'flex', 
            flexDirection: 'column',
            gap: 3,
            p: { xs: 2, md: 3 }
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
                            Tipos de Producto
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra los productos y servicios
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
                        Nuevo Tipo
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
                            placeholder="Buscar por Nombre o Tipo..."
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(handleSanitizeSearchInput(e.target.value))}
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
                            options={categorias?.data?.map(c => c.text) || []}
                            value={selectedCategoria}
                            onChange={(_, newValue) => setSelectedCategoria(newValue)}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    placeholder="Filtrar por Categoría" 
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
                        <TipoProductoTable
                            data={data?.data}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    </Box>

                    {/* Mobile List */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <TipoProductoMobileList
                            data={data?.data}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    </Box>
                </Box>

                <CreateEditTipoProductoModal 
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    tipoProductoToEdit={tipoToEdit}
                    onSuccess={handleSuccess}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Eliminar Tipo de Producto"
                    content={`¿Estás seguro que deseas eliminar "${tipoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setTipoToDelete(null);
                    }}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    severity="error"
                />
            </Box>
        </Box>
    );
}