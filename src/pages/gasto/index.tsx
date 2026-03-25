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
import { gastoApi } from '@entities/gasto/api/gasto.api';
import { useState, useEffect } from 'react';
import { useLayoutStore } from '@shared/store/layout.store';
import { CreateEditGastoModal } from '../../features/gasto/create-edit/ui/CreateEditGastoModal';
import type { Gasto } from '@entities/gasto/model/types';
import { GastoTable } from '../../features/gasto/list/ui/GastoTable';
import { GastoMobileList } from '../../features/gasto/list/ui/GastoMobileList';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { handleSanitizeSearchInput } from '@/shared/utils/input-validators';
import { useDeleteGasto } from '@/features/gasto/hooks/useGastoCrud';

export function GastoPage() {
    const theme = useTheme();
    const setPageTitle = useLayoutStore((state) => state.setPageTitle);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [gastoToEdit, setGastoToEdit] = useState<Gasto | null>(null);
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [gastoToDelete, setGastoToDelete] = useState<Gasto | null>(null);

    const deleteMutation = useDeleteGasto();

    useEffect(() => {
        setPageTitle('Gastos');
    }, [setPageTitle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['gastos', page, rowsPerPage, debouncedSearch],
        queryFn: () => gastoApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch
        })
    });

    const handleCreate = () => {
        setGastoToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (gasto: Gasto) => {
        setGastoToEdit(gasto);
        setModalOpen(true);
    };

    const handleDeleteClick = (gasto: Gasto) => {
        setGastoToDelete(gasto);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!gastoToDelete) return;
        try {
            await deleteMutation.mutateAsync(gastoToDelete.gastoID);
            setDeleteDialogOpen(false);
            setGastoToDelete(null);
        } catch (error: unknown) {
            // Error is handled by useGenericCrud
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
                            Gastos
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra el catálogo de gastos
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
                        Nuevo Gasto
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
                        <GastoTable
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
                        <GastoMobileList
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

                <CreateEditGastoModal 
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    gastoToEdit={gastoToEdit}
                    onSuccess={handleSuccess}
                />

                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Eliminar Gasto"
                    content={`¿Estás seguro que deseas eliminar "${gastoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                    onConfirm={handleConfirmDelete}
                    onClose={() => {
                        setDeleteDialogOpen(false);
                        setGastoToDelete(null);
                    }}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    severity="error"
                />
            </Box>
        </Box>
    );
}