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
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { CreateEditMercaderiaModal } from '@features/mercaderia/create-edit/ui/CreateEditMercaderiaModal';
import { MercaderiaTable } from './MercaderiaTable';
import { MercaderiaMobileList } from './MercaderiaMobileList';
import type { useMercaderiaPageController } from '../hooks/useMercaderiaPageController';

interface MercaderiaPageContentProps {
    controller: ReturnType<typeof useMercaderiaPageController>;
}

export function MercaderiaPageContent({ controller }: MercaderiaPageContentProps) {
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
                            Mercaderías
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra el catálogo de mercaderías
                        </Typography>
                    </Box>
                    {controller.canManageMercaderia ? (
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
                            Nueva Mercadería
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
                    <Box sx={{ flex: 1, maxWidth: '400px' }}>
                        <TextField
                            placeholder="Buscar por Nombre..."
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
                        <MercaderiaTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onEdit={controller.canManageMercaderia ? controller.handleEdit : undefined}
                            onDelete={controller.canManageMercaderia ? controller.handleDeleteClick : undefined}
                        />
                    </Box>

                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <MercaderiaMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onEdit={controller.canManageMercaderia ? controller.handleEdit : undefined}
                            onDelete={controller.canManageMercaderia ? controller.handleDeleteClick : undefined}
                        />
                    </Box>
                </Box>

                {controller.canManageMercaderia ? (
                    <>
                        <CreateEditMercaderiaModal
                            open={controller.modalOpen}
                            onClose={controller.handleCloseModal}
                            mercaderiaToEdit={controller.mercaderiaToEdit}
                            onSuccess={controller.handleSuccess}
                        />

                        <ConfirmDialog
                            open={controller.deleteDialogOpen}
                            title="Eliminar Mercadería"
                            content={`¿Estás seguro que deseas eliminar "${controller.mercaderiaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
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
