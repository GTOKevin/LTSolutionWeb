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
import { CreateEditTipoMaestroModal } from '@features/tipo-maestro/create-edit/ui/CreateEditTipoMaestroModal';
import { TipoMaestroTable } from './TipoMaestroTable';
import { TipoMaestroMobileList } from './TipoMaestroMobileList';
import type { useMaestrosPageController } from '../hooks/useMaestrosPageController';

interface MaestrosPageContentProps {
    controller: ReturnType<typeof useMaestrosPageController>;
}

export function MaestrosPageContent({ controller }: MaestrosPageContentProps) {
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
                            Gestión de Maestros
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Administra las tablas maestras y configuraciones del sistema
                        </Typography>
                    </Box>
                    {controller.canManageMaestros ? (
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
                            Nuevo Maestro
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
                            placeholder="Buscar por Nombre o Código..."
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
                            options={controller.secciones}
                            value={controller.selectedSeccion}
                            onChange={(_, newValue) => controller.handleChangeSeccion(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Filtrar por Sección"
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
                        <TipoMaestroTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.canViewMaestros ? controller.handleView : undefined}
                            onEdit={controller.canManageMaestros ? controller.handleEdit : undefined}
                        />
                    </Box>

                    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                        <TipoMaestroMobileList
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            onView={controller.canViewMaestros ? controller.handleView : undefined}
                            onEdit={controller.canManageMaestros ? controller.handleEdit : undefined}
                        />
                    </Box>
                </Box>

                <CreateEditTipoMaestroModal
                    open={controller.modalOpen}
                    onClose={controller.handleCloseModal}
                    maestroToEdit={controller.maestroToEdit}
                    onSuccess={controller.handleSuccess}
                    viewOnly={controller.viewOnlyMode}
                />
            </Box>
        </Box>
    );
}
