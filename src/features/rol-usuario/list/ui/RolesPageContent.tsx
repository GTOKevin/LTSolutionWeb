import {
    Box,
    Typography,
    Button,
    useTheme,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { CreateEditRolUsuarioModal } from '@features/rol-usuario/create-edit';
import { RolUsuarioTable } from './RolUsuarioTable';
import { RolUsuarioMobileList } from './RolUsuarioMobileList';
import type { useRolesPageController } from '../hooks/useRolesPageController';

interface RolesPageContentProps {
    controller: ReturnType<typeof useRolesPageController>;
}

export function RolesPageContent({ controller }: RolesPageContentProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                p: { xs: 2, md: 3 },
            }}
        >
            <Box sx={{ maxWidth: 1600, mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Gestión de Roles
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra los roles y permisos de acceso al sistema
                        </Typography>
                    </Box>
                    {controller.canManageRoles ? (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={controller.handleCreate}
                            sx={{
                                boxShadow: 2,
                                fontWeight: 'bold',
                                px: 3,
                                py: 1.2,
                                borderRadius: 2,
                            }}
                        >
                            Nuevo Rol
                        </Button>
                    ) : null}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        bgcolor: theme.palette.background.paper,
                        p: 2,
                        borderRadius: 3,
                        boxShadow: theme.shadows[1],
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <TextField
                        placeholder="Buscar por Nombre de Rol..."
                        size="small"
                        fullWidth
                        value={controller.searchTerm}
                        onChange={(event) => controller.handleSearchChange(event.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2 },
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        flex: 1,
                        minHeight: 0,
                    }}
                >
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flex: 1, minHeight: 0, flexDirection: 'column' }}>
                        <RolUsuarioTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.canViewRoles ? controller.handleView : undefined}
                            onEdit={controller.canManageRoles ? controller.handleEdit : undefined}
                        />
                    </Box>

                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <RolUsuarioMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.canViewRoles ? controller.handleView : undefined}
                            onEdit={controller.canManageRoles ? controller.handleEdit : undefined}
                        />
                    </Box>
                </Box>

                <CreateEditRolUsuarioModal
                    open={controller.modalOpen}
                    onClose={controller.handleCloseModal}
                    rolToEdit={controller.rolToEdit}
                    onSuccess={controller.handleSuccess}
                    viewOnly={controller.viewOnlyMode}
                />
            </Box>
        </Box>
    );
}
