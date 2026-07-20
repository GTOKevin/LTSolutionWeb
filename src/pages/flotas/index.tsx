import {
    Alert,
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import { useState, useEffect } from 'react';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import type { Flota } from '@entities/flota/model/types';
import { FlotaTable } from '@features/flota/list/ui/FlotaTable';
import { FlotaMobileList } from '@features/flota/list/ui/FlotaMobileList';
import { useDeleteFlota } from '@features/flota/hooks/useFlotaCrud';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { handleSanitizeSearchInput } from '@shared/utils/input-validators';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '@shared/lib/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';

export function FlotasPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const canManageFlotas = usePermission(PERMISSIONS.FLOTA.GESTIONAR);
    
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Delete Dialog State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [flotaToDelete, setFlotaToDelete] = useState<Flota | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0);
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Queries
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.list(page, rowsPerPage, debouncedSearch),
        queryFn: () => flotaApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: debouncedSearch || undefined
        })
    });

    // Mutations
    const deleteMutation = useDeleteFlota();

    // Handlers
    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCreate = () => {
        navigate('/app/flotas/nuevo');
    };

    const handleEdit = (flota: Flota) => {
        navigate(`/app/flotas/${flota.flotaID}`);
    };

    const handleView = (flota: Flota) => {
        navigate(`/app/flotas/${flota.flotaID}/ver`);
    };

    const handleDeleteClick = (flota: Flota) => {
        setFlotaToDelete(flota);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (flotaToDelete) {
            deleteMutation.mutate(flotaToDelete.flotaID, {
                onSuccess: () => {
                    setOpenDeleteDialog(false);
                    setFlotaToDelete(null);
                }
            });
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
                    {canManageFlotas ? (
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
                    ) : null}
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

                {isError ? (
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={() => refetch()}>
                                Reintentar
                            </Button>
                        }
                    >
                        No se pudo cargar la lista de vehículos. Verifique la conexión con el backend e intente nuevamente.
                    </Alert>
                ) : null}

                {/* Main Content */}
                <FlotaTable
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onEdit={canManageFlotas ? handleEdit : undefined}
                    onDelete={canManageFlotas ? handleDeleteClick : undefined}
                    onView={handleView}
                />

                <FlotaMobileList
                    data={data?.data}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    onEdit={canManageFlotas ? handleEdit : undefined}
                    onDelete={canManageFlotas ? handleDeleteClick : undefined}
                    onView={handleView}
                />
            </Box>

            <ConfirmDialog
                open={openDeleteDialog}
                title="Eliminar Vehículo"
                content={`¿Está seguro que desea eliminar el vehículo con placa ${flotaToDelete?.placa}? Esta acción no se puede deshacer.`}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
