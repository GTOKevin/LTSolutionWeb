import {
    Box,
    Typography,
    Button,
    useTheme,
    alpha,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colaboradorApi } from '@entities/colaborador/api/colaborador.api';
import type { Colaborador } from '@entities/colaborador/model/types';
import { ColaboradorTable } from '@features/colaborador/list/ui/ColaboradorTable';
import { ColaboradorMobileList } from '@features/colaborador/list/ui/ColaboradorMobileList';
import { CreateEditColaboradorModal } from '@features/colaborador/create-edit/ui/CreateEditColaboradorModal';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';

export function ColaboradoresPage() {
    const theme = useTheme();
    const queryClient = useQueryClient();
    
    // State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
    const [viewOnly, setViewOnly] = useState(false);
    
    // Delete Dialog State
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

    // Queries
    const { data, isLoading } = useQuery({
        queryKey: ['colaboradores', page, rowsPerPage, searchTerm],
        queryFn: () => colaboradorApi.getAll({
            page: page + 1,
            size: rowsPerPage,
            search: searchTerm || undefined
        })
    });

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => colaboradorApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
            setOpenDeleteDialog(false);
            setColaboradorToDelete(null);
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
        setSelectedColaborador(null);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleEdit = (colaborador: Colaborador) => {
        setSelectedColaborador(colaborador);
        setViewOnly(false);
        setOpenModal(true);
    };

    const handleView = (colaborador: Colaborador) => {
        setSelectedColaborador(colaborador);
        setViewOnly(true);
        setOpenModal(true);
    };

    const handleDeleteClick = (colaborador: Colaborador) => {
        setColaboradorToDelete(colaborador);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (colaboradorToDelete) {
            deleteMutation.mutate(colaboradorToDelete.colaboradorID);
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
                            Gestión de Colaboradores
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra conductores y personal administrativo
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
                        Nuevo Colaborador
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
                            placeholder="Buscar por Nombre, DNI o Rol..."
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
                <ColaboradorTable
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

                <ColaboradorMobileList
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

            {/* Modals */}
            <CreateEditColaboradorModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                colaboradorToEdit={selectedColaborador}
                onSuccess={() => {
                    setOpenModal(false);
                }}
                viewOnly={viewOnly}
            />

            <ConfirmDialog
                open={openDeleteDialog}
                title="Eliminar Colaborador"
                content={`¿Está seguro que desea eliminar al colaborador ${colaboradorToDelete?.nombres}? Esta acción no se puede deshacer.`}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
            />
        </Box>
    );
}
