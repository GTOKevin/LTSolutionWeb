import {
    Box,
    Button,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import type { useClientesPageController } from '../hooks/useClientesPageController';
import { ClientesMobileList } from './ClientesMobileList';
import { ClientesTable } from './ClientesTable';

interface ClientesPageContentProps {
    controller: ReturnType<typeof useClientesPageController>;
}

export function ClientesPageContent({ controller }: ClientesPageContentProps) {
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
                            Cartera de Clientes
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestione la información, documentación y contactos de sus clientes.
                        </Typography>
                    </Box>

                    {controller.canManageClientes ? (
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
                            Nuevo Cliente
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
                            placeholder="Buscar por Razón Social o ID Fiscal..."
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
                    <Box sx={{ minWidth: '200px' }}>
                        <Select
                            size="small"
                            fullWidth
                            value={controller.statusFilter}
                            onChange={(event) => controller.setStatusFilter(event.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value=" ">Todos los Estados</MenuItem>
                            <MenuItem value="1">Activo</MenuItem>
                            <MenuItem value="0">Inactivo</MenuItem>
                        </Select>
                    </Box>
                </Box>

                <ClientesTable
                    data={controller.data}
                    isLoading={controller.isLoading}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    onView={controller.canViewClientes ? controller.handleView : undefined}
                    onEdit={controller.canManageClientes ? controller.handleEdit : undefined}
                    onDelete={controller.canManageClientes ? controller.handleDeleteClick : undefined}
                />

                <ClientesMobileList
                    data={controller.data}
                    isLoading={controller.isLoading}
                    page={controller.page}
                    rowsPerPage={controller.rowsPerPage}
                    onPageChange={controller.handleChangePage}
                    onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    onView={controller.canViewClientes ? controller.handleView : undefined}
                    onEdit={controller.canManageClientes ? controller.handleEdit : undefined}
                    onDelete={controller.canManageClientes ? controller.handleDeleteClick : undefined}
                />
            </Box>

            <ConfirmDialog
                open={controller.deleteConfirmOpen}
                title="Eliminar Cliente"
                content={
                    <Typography>
                        ¿Está seguro de eliminar el cliente <strong>{controller.clienteToDelete?.razonSocial}</strong> con RUC <strong>{controller.clienteToDelete?.ruc}</strong>?
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
