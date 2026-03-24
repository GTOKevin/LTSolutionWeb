import {
    Box,
    Typography,
    Button,
    useTheme,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { mercaderiaApi } from '@entities/mercaderia/api/mercaderia.api';
import { useState, useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { CreateEditMercaderiaModal } from '../../features/mercaderia/create-edit/ui/CreateEditMercaderiaModal';
import type { Mercaderia } from '@entities/mercaderia/model/types';
import { MercaderiaTable } from '../../features/mercaderia/list/ui/MercaderiaTable';
import { MercaderiaMobileList } from '../../features/mercaderia/list/ui/MercaderiaMobileList';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import { useDeleteMercaderia } from '@/features/mercaderia/hooks/useMercaderiaCrud';
import { useToast } from '@/shared/components/ui/Toast';

export function MercaderiaPage() {
    const theme = useTheme();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [mercaderiaToEdit, setMercaderiaToEdit] = useState<Mercaderia | null>(null);
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [mercaderiaToDelete, setMercaderiaToDelete] = useState<Mercaderia | null>(null);

    const deleteMutation = useDeleteMercaderia();

    useEffect(() => {
        setPageTitle('Mercaderías');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['mercaderias', page, rowsPerPage, debouncedSearch],
        queryFn: () => mercaderiaApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch
        })
    });

    const handleCreate = () => {
        setMercaderiaToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (mercaderia: Mercaderia) => {
        setMercaderiaToEdit(mercaderia);
        setModalOpen(true);
    };

    const handleDeleteClick = (mercaderia: Mercaderia) => {
        setMercaderiaToDelete(mercaderia);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!mercaderiaToDelete) return;
        try {
            await deleteMutation.mutateAsync(mercaderiaToDelete.mercaderiaID);
            showToast({ message: 'Mercadería eliminada exitosamente', severity: 'success' });
            setDeleteDialogOpen(false);
            setMercaderiaToDelete(null);
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
                            Mercaderías
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra el catálogo de mercaderías
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
                        Nueva Mercadería
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
                    <Box sx={{ flex: 1, maxWidth: '400px' }}>
                        <TextField
                            placeholder="Buscar por Nombre..."
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
                        <MercaderiaTable
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
                        <MercaderiaMobileList
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

                <CreateEditMercaderiaModal 
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    mercaderiaToEdit={mercaderiaToEdit}
                    onSuccess={handleSuccess}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Eliminar Mercadería"
                    content={`¿Estás seguro que deseas eliminar "${mercaderiaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setMercaderiaToDelete(null);
                    }}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    severity="error"
                />
            </Box>
        </Box>
    );
}
