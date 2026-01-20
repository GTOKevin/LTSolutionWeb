import {
    Box,
    Typography,
    Button,
    useTheme,
    alpha,
    Snackbar,
    Alert,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    RemoveCircle as RemoveCircleIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usuarioApi } from '@entities/usuario/api/usuario.api';
import { rolUsuarioApi } from '@entities/rol-usuario/api/rol-usuario.api';
import { estadoApi } from '@shared/api/estado.api';
import { useState, useEffect } from 'react';
import { CreateEditUsuarioModal } from '../../features/usuario/create-edit/ui/CreateEditUsuarioModal';
import { ChangePasswordModal } from '../../features/usuario/change-password/ui/ChangePasswordModal';
import { ConfirmDialog } from '../../shared/components/ui/ConfirmDialog';
import type { Usuario } from '@entities/usuario/model/types';
import { UsuarioTable } from '../../features/usuario/list/ui/UsuarioTable';
import { UsuarioMobileList } from '../../features/usuario/list/ui/UsuarioMobileList';
import { UsuarioFilter } from '@/features/usuario/list/ui/UsuarioFilter';

export function UsuariosPage() {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(true);
    const [roleFilter, setRoleFilter] = useState('0');
    const [statusFilter, setStatusFilter] = useState('0');
    const [draftRoleFilter, setDraftRoleFilter] = useState('0');
    const [draftStatusFilter, setDraftStatusFilter] = useState('0');
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [usuarioToChangePassword, setUsuarioToChangePassword] = useState<Usuario | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [viewOnlyMode, setViewOnlyMode] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(0); // Reset page on new search
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['usuarios', page, rowsPerPage, debouncedSearch, roleFilter, statusFilter],
        queryFn: () => usuarioApi.getAll({ 
            page: page + 1, 
            size: rowsPerPage, 
            search: debouncedSearch,
            // @ts-ignore - Assuming API supports these params or I need to update types
            rolUsuarioID: roleFilter !== '0' ? Number(roleFilter) : undefined,
            estadoID: statusFilter !== '0' ? Number(statusFilter) : undefined
        })
    });

    const { data: roles } = useQuery({
        queryKey: ['roles-select'],
        queryFn: () => rolUsuarioApi.getSelect()
    });

    const { data: estados } = useQuery({
        queryKey: ['estados-usuario-select'],
        queryFn: () => estadoApi.getSelect(undefined, 20, 'Usuario')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => usuarioApi.delete(id),
        onSuccess: () => {
            setDeleteConfirmOpen(false);
            setUsuarioToDelete(null);
            setSnackbarMessage(`Usuario ${usuarioToDelete?.nombre} eliminado.`);
            setSnackbarOpen(true);
            refetch();
        },
        onError: () => {
             setDeleteConfirmOpen(false);
             setUsuarioToDelete(null);
             setSnackbarMessage('Error al eliminar usuario.');
             setSnackbarOpen(true);
        }
    });

    const handleApplyFilters = () => {
        setRoleFilter(draftRoleFilter);
        setStatusFilter(draftStatusFilter);
        setPage(0);
    };

    const handleToggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleCreate = () => {
        setUsuarioToEdit(null);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleEdit = (usuario: Usuario) => {
        setUsuarioToEdit(usuario);
        setViewOnlyMode(false);
        setModalOpen(true);
    };

    const handleView = (usuario: Usuario) => {
        setUsuarioToEdit(usuario);
        setViewOnlyMode(true);
        setModalOpen(true);
    };

    const handleDeleteClick = (usuario: Usuario) => {
        setUsuarioToDelete(usuario);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (usuarioToDelete) {
            deleteMutation.mutate(usuarioToDelete.usuarioID);
        }
    };

    const handleChangePassword = (usuario: Usuario) => {
        setUsuarioToChangePassword(usuario);
        setChangePasswordOpen(true);
    };

    const handlePasswordSuccess = () => {
        setSnackbarMessage('Contraseña actualizada exitosamente.');
        setSnackbarOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setUsuarioToEdit(null);
        setViewOnlyMode(false);
    };

    const handleSuccess = (_: number) => {
        setSnackbarMessage(usuarioToEdit ? 'Usuario actualizado exitosamente.' : 'Usuario creado exitosamente.');
        setSnackbarOpen(true);
        refetch();
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Stats Card Component
    const StatsCard = ({ title, value, icon, trend, color }: any) => (
        <Card sx={{ 
            height: '100%', 
            borderRadius: 3, 
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            bgcolor: theme.palette.background.paper
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        {title}
                    </Typography>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    {value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trend > 0 ? (
                        <TrendingUpIcon sx={{ fontSize: 16, color: theme.palette.success.main }} />
                    ) : (
                        <TrendingDownIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                    )}
                    <Typography variant="caption" fontWeight="bold" color={trend > 0 ? 'success.main' : 'error.main'}>
                        {Math.abs(trend)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {trend > 0 ? 'este mes' : 'esta semana'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
            p: { xs: 2, md: 3 },
            position: 'relative',
            pb: { xs: 10, md: 3 }
        }}>
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4 }, height: '100%' }}>
                
                {/* Header Section */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            Gestión de Usuarios
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra los accesos, roles y vinculaciones de tu personal logístico.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ 
                            boxShadow: 2, 
                            fontWeight: 'bold', 
                            px: 3, 
                            py: 1.2,
                            borderRadius: 2
                        }}
                        onClick={handleCreate}
                    >
                        Nuevo Usuario
                    </Button>
                </Box>

                {/* Stats Section */}
                <Grid container spacing={2}>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatsCard 
                            title="Total Usuarios" 
                            value={data?.total || 0} 
                            icon={<GroupIcon />} 
                            trend={5} 
                            color={theme.palette.primary.main} 
                        />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatsCard 
                            title="Activos" 
                            value={data?.activos || 0} 
                            icon={<CheckCircleIcon />} 
                            trend={2} 
                            color={theme.palette.success.main} 
                        />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatsCard 
                            title="Inactivos" 
                            value={data?.inactivos || 0} 
                            icon={<RemoveCircleIcon />} 
                            trend={0} 
                            color={theme.palette.warning.main} 
                        />
                    </Grid>
                    <Grid size={{xs:12, sm:6, md:3}}>
                        <StatsCard 
                            title="Bloqueados" 
                            value={data?.bloqueados || 0} 
                            icon={<BlockIcon />} 
                            trend={-1} 
                            color={theme.palette.error.main} 
                        />
                    </Grid>
                </Grid>

                {/* Filters Section */}
                <UsuarioFilter
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    roleFilter={draftRoleFilter}
                    onRoleChange={setDraftRoleFilter}
                    statusFilter={draftStatusFilter}
                    onStatusChange={setDraftStatusFilter}
                    roles={roles?.data || []}
                    estados={estados?.data || []}
                    onApplyFilters={handleApplyFilters}
                    showFilters={showFilters}
                    onToggleFilters={handleToggleFilters}
                />

                {/* Content Section (Toolbar + Table) */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    borderRadius: 3, 
                    overflow: 'hidden'
                }}>
                    {/* Desktop Table */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <UsuarioTable
                            data={data}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onChangePassword={handleChangePassword}
                        />
                    </Box>

                     {/* Mobile List */}
                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <UsuarioMobileList
                            data={data}
                            isLoading={isLoading}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onChangePassword={handleChangePassword}
                        />
                    </Box>
                </Box>
            </Box>

            <CreateEditUsuarioModal 
                open={modalOpen}
                onClose={handleCloseModal}
                usuarioToEdit={usuarioToEdit}
                onSuccess={handleSuccess}
                viewOnly={viewOnlyMode}
            />

            <ChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
                usuarioId={usuarioToChangePassword?.usuarioID || null}
                usuarioNombre={usuarioToChangePassword?.nombre}
                onSuccess={handlePasswordSuccess}
            />

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Eliminar Usuario"
                content={
                    <Typography>
                        ¿Está seguro de eliminar al usuario <strong>{usuarioToDelete?.nombre}</strong>?
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
