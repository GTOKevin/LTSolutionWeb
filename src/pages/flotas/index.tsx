import {
    Box,
    Typography,
    Button,
    Container,
    IconButton,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon,
    LocalShipping as TruckIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { Flota } from '@entities/flota/model/types';
import { FlotaTable } from '@features/flota/list/ui/FlotaTable';
import { FlotaMobileList } from '@features/flota/list/ui/FlotaMobileList';
import { CreateEditFlotaModal } from '@features/flota/create-edit/ui/CreateEditFlotaModal';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';

export function FlotasPage() {
    const theme = useTheme();
    const queryClient = useQueryClient();
    
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedFlota, setSelectedFlota] = useState<Flota | null>(null);
    const [viewOnly, setViewOnly] = useState(false);
    
    // Delete Dialog State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [flotaToDelete, setFlotaToDelete] = useState<Flota | null>(null);

    // Queries
    const { data, isLoading } = useQuery({
        queryKey: ['flotas', page, rowsPerPage, searchTerm],
        queryFn: () => flotaApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: searchTerm || undefined
        })
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => flotaApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flotas'] });
            setOpenDeleteDialog(false);
            setFlotaToDelete(null);
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
                        <TruckIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color="text.primary">
                            Gestión de Flota
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Administre sus vehículos y documentación
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
                            onClick={() => queryClient.invalidateQueries({ queryKey: ['flotas'] })}
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
                        Nuevo Vehículo
                    </Button>
                </Box>
            </Box>

            {/* Content */}
            <FlotaMobileList
                data={data?.data}
                isLoading={isLoading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <FlotaTable
                data={data?.data}
                isLoading={isLoading}
                page={page}
                rowsPerPage={rowsPerPage}
                showFilters={showFilters}
                searchTerm={searchTerm}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                onSearchChange={setSearchTerm}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            {/* Modals */}
            <CreateEditFlotaModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                flotaToEdit={selectedFlota}
                onSuccess={() => {
                    // Refresh handled by modal mutation success
                }}
                viewOnly={viewOnly}
            />

            <ConfirmDialog
                open={openDeleteDialog}
                title="Eliminar Vehículo"
                content={`¿Está seguro que desea eliminar el vehículo con placa ${flotaToDelete?.placa}? Esta acción no se puede deshacer.`}
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
