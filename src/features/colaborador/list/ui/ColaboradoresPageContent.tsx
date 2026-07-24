import {
    Alert,
    Box,
    Button,
    InputAdornment,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { ColaboradorMobileList } from './ColaboradorMobileList';
import { ColaboradorTable } from './ColaboradorTable';
import type { useColaboradoresPageController } from '../hooks/useColaboradoresPageController';

interface ColaboradoresPageContentProps {
    controller: ReturnType<typeof useColaboradoresPageController>;
}

export function ColaboradoresPageContent({ controller }: ColaboradoresPageContentProps) {
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
            <Box
                sx={{
                    maxWidth: 1600,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 2, md: 3 },
                    height: '100%',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
                            Gestión de Colaboradores
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra conductores y personal administrativo
                        </Typography>
                    </Box>
                    {controller.canManageColaboradores ? (
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
                            Nuevo Colaborador
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
                        flexWrap: 'wrap',
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: '250px' }}>
                        <TextField
                            placeholder="Buscar por Nombre, DNI o Rol..."
                            size="small"
                            fullWidth
                            value={controller.searchTerm}
                            onChange={(event) => controller.handleSearchTermChange(event.target.value)}
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
                </Box>

                {controller.isError ? (
                    <Alert
                        severity="error"
                        action={(
                            <Button color="inherit" size="small" onClick={() => controller.refetch()}>
                                Reintentar
                            </Button>
                        )}
                    >
                        No se pudo cargar la lista de colaboradores. Verifique la conexión con el backend e intente nuevamente.
                    </Alert>
                ) : null}

                <ColaboradorTable
                    data={controller.data}
                    isLoading={controller.isLoading}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    onView={controller.handleView}
                    onEdit={controller.canManageColaboradores ? controller.handleEdit : undefined}
                    onDelete={controller.canManageColaboradores ? controller.handleDeleteClick : undefined}
                />

                <ColaboradorMobileList
                    data={controller.data}
                    isLoading={controller.isLoading}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    onView={controller.handleView}
                    onEdit={controller.canManageColaboradores ? controller.handleEdit : undefined}
                    onDelete={controller.canManageColaboradores ? controller.handleDeleteClick : undefined}
                />
            </Box>

            <ConfirmDialog
                open={controller.openDeleteDialog}
                title="Eliminar Colaborador"
                content={`¿Está seguro que desea eliminar al colaborador ${controller.colaboradorToDelete?.nombres}? Esta acción no se puede deshacer.`}
                onClose={() => controller.setOpenDeleteDialog(false)}
                onConfirm={controller.handleConfirmDelete}
                isLoading={controller.deleteMutation.isPending}
            />
        </Box>
    );
}
