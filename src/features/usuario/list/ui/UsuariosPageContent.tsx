import {
    Box,
    Typography,
    Button,
    useTheme,
    Grid,
} from '@mui/material';
import {
    Add as AddIcon,
    Group as GroupIcon,
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import { CreateEditUsuarioModal } from '@/features/usuario/create-edit/ui/CreateEditUsuarioModal';
import { ChangePasswordModal } from '@/features/usuario/change-password/ui/ChangePasswordModal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { UsuarioTable } from './UsuarioTable';
import { UsuarioMobileList } from './UsuarioMobileList';
import { UsuarioFilter } from './UsuarioFilter';
import { StatsCard } from '@/shared/components/ui/StatsCard';
import type { useUsuariosPageController } from '../hooks/useUsuariosPageController';

interface UsuariosPageContentProps {
    controller: ReturnType<typeof useUsuariosPageController>;
}

export function UsuariosPageContent({ controller }: UsuariosPageContentProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? '#101922' : '#f6f7f8',
                p: { xs: 2, md: 3 },
                position: 'relative',
                pb: { xs: 10, md: 3 },
            }}
        >
            <Box sx={{ maxWidth: 1600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4 }, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            Gestión de Usuarios
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra los accesos, roles y vinculaciones de tu personal logístico.
                        </Typography>
                    </Box>

                    {controller.canManageUsuarios ? (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                boxShadow: 2,
                                fontWeight: 'bold',
                                px: 3,
                                py: 1.2,
                                borderRadius: 2,
                            }}
                            onClick={controller.handleCreate}
                        >
                            Nuevo Usuario
                        </Button>
                    ) : null}
                </Box>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatsCard
                            title="Total Usuarios"
                            value={controller.data?.total || 0}
                            icon={<GroupIcon />}
                            color={theme.palette.primary.main}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatsCard
                            title="Activos"
                            value={controller.data?.activos || 0}
                            icon={<CheckCircleIcon />}
                            color={theme.palette.success.main}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatsCard
                            title="Inactivos"
                            value={controller.data?.inactivos || 0}
                            icon={<RemoveCircleIcon />}
                            color={theme.palette.warning.main}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatsCard
                            title="Bloqueados"
                            value={controller.data?.bloqueados || 0}
                            icon={<BlockIcon />}
                            color={theme.palette.error.main}
                        />
                    </Grid>
                </Grid>

                <UsuarioFilter
                    searchTerm={controller.searchTerm}
                    onSearchChange={controller.setSearchTerm}
                    roleFilter={controller.draftRoleFilter}
                    onRoleChange={controller.setDraftRoleFilter}
                    statusFilter={controller.draftStatusFilter}
                    onStatusChange={controller.setDraftStatusFilter}
                    roles={controller.roles || []}
                    estados={controller.estados || []}
                    onApplyFilters={controller.handleApplyFilters}
                    showFilters={controller.showFilters}
                    onToggleFilters={controller.handleToggleFilters}
                />

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        flex: 1,
                        minHeight: 500,
                    }}
                >
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, minHeight: 0, flexDirection: 'column' }}>
                        <UsuarioTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.handleView}
                            onEdit={controller.canManageUsuarios ? controller.handleEdit : undefined}
                            onDelete={controller.canManageUsuarios ? controller.handleDeleteClick : undefined}
                            onChangePassword={controller.canManageUsuarios ? controller.handleChangePassword : undefined}
                        />
                    </Box>

                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <UsuarioMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.handleView}
                            onEdit={controller.canManageUsuarios ? controller.handleEdit : undefined}
                            onDelete={controller.canManageUsuarios ? controller.handleDeleteClick : undefined}
                            onChangePassword={controller.canManageUsuarios ? controller.handleChangePassword : undefined}
                        />
                    </Box>
                </Box>
            </Box>

            <CreateEditUsuarioModal
                open={controller.modalOpen}
                onClose={controller.handleCloseModal}
                usuarioToEdit={controller.usuarioToEdit}
                onSuccess={controller.handleSuccess}
                viewOnly={controller.viewOnlyMode}
            />

            <ChangePasswordModal
                open={controller.changePasswordOpen}
                onClose={() => controller.setChangePasswordOpen(false)}
                usuarioId={controller.usuarioToChangePassword?.usuarioID || null}
                usuarioNombre={controller.usuarioToChangePassword?.nombre}
                onSuccess={controller.handlePasswordSuccess}
            />

            <ConfirmDialog
                open={controller.deleteConfirmOpen}
                title="Eliminar Usuario"
                content={
                    <Typography>
                        ¿Está seguro de eliminar al usuario <strong>{controller.usuarioToDelete?.nombre}</strong>?
                    </Typography>
                }
                onClose={() => controller.setDeleteConfirmOpen(false)}
                onConfirm={controller.handleConfirmDelete}
                severity="error"
                confirmText="Eliminar"
                isLoading={controller.deleteMutation.isPending}
            />
        </Box>
    );
}
