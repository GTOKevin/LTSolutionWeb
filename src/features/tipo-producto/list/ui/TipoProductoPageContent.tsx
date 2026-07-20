import {
    Box,
    Typography,
    Button,
    useTheme,
    TextField,
    InputAdornment,
    Autocomplete,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { CreateEditTipoProductoModal } from '@features/tipo-producto/create-edit/ui/CreateEditTipoProductoModal';
import { TipoProductoTable } from './TipoProductoTable';
import { TipoProductoMobileList } from './TipoProductoMobileList';
import type { useTipoProductoPageController } from '../hooks/useTipoProductoPageController';

interface TipoProductoPageContentProps {
    controller: ReturnType<typeof useTipoProductoPageController>;
}

export function TipoProductoPageContent({ controller }: TipoProductoPageContentProps) {
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
                            Tipos de Producto
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra los productos y servicios
                        </Typography>
                    </Box>
                    {controller.canManageTipoProducto ? (
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
                            Nuevo Tipo
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
                            placeholder="Buscar por Nombre o Tipo..."
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

                    <Box sx={{ minWidth: '250px' }}>
                        <Autocomplete
                            options={controller.categorias}
                            value={controller.selectedCategoria}
                            onChange={(_, newValue) => controller.handleChangeCategoria(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Filtrar por Categoría"
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <FilterIcon color="action" fontSize="small" />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                        sx: { borderRadius: 2 },
                                    }}
                                />
                            )}
                        />
                    </Box>
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
                        <TipoProductoTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onEdit={controller.canManageTipoProducto ? controller.handleEdit : undefined}
                            onDelete={controller.canManageTipoProducto ? controller.handleDeleteClick : undefined}
                        />
                    </Box>

                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <TipoProductoMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onEdit={controller.canManageTipoProducto ? controller.handleEdit : undefined}
                            onDelete={controller.canManageTipoProducto ? controller.handleDeleteClick : undefined}
                        />
                    </Box>
                </Box>

                {controller.canManageTipoProducto ? (
                    <>
                        <CreateEditTipoProductoModal
                            open={controller.modalOpen}
                            onClose={controller.handleCloseModal}
                            tipoProductoToEdit={controller.tipoToEdit}
                            onSuccess={controller.handleSuccess}
                        />

                        <ConfirmDialog
                            open={controller.deleteDialogOpen}
                            title="Eliminar Tipo de Producto"
                            content={`¿Estás seguro que deseas eliminar "${controller.tipoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                            onConfirm={controller.handleConfirmDelete}
                            onClose={controller.handleCloseDeleteDialog}
                            confirmText="Eliminar"
                            cancelText="Cancelar"
                            severity="error"
                            isLoading={controller.deleteMutation.isPending}
                        />
                    </>
                ) : null}
            </Box>
        </Box>
    );
}
