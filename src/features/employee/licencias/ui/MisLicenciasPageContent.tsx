import {
    Box,
    Button,
    Grid,
    MenuItem,
    TableCell,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    CheckCircleOutline,
    EventAvailableOutlined,
    PendingActionsOutlined,
    FolderShared as FolderSharedIcon,
    FilterList as FilterListIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { SolicitarLicenciaModal } from './SolicitarLicenciaModal';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { portalTableContainerFlatSx, portalTableHeaderFlatSx } from '@shared/components/ui/employee-portal-shell.styles';
import { MisLicenciasMobileList } from './MisLicenciasMobileList';
import type { MiLicenciaDto } from '@entities/employee/model/types';
import { formatDateOnly } from '@shared/utils/date-utils';
import type { useMisLicenciasPageController } from '../hooks/useMisLicenciasPageController';

const columns: Column[] = [
    { id: 'tipo', label: 'TIPO' },
    { id: 'periodo', label: 'PERIODO', align: 'center' },
    { id: 'descripcion', label: 'DESCRIPCIÓN' },
    { id: 'estado', label: 'ESTADO' },
    { id: 'resolucion', label: 'RESOLUCIÓN', align: 'right' },
];

function getStatusColor(item: MiLicenciaDto): 'success' | 'warning' | 'error' {
    switch (item.estadoRevision) {
        case 'aprobada':
            return 'success';
        case 'rechazada':
            return 'error';
        default:
            return 'warning';
    }
}

interface MisLicenciasPageContentProps {
    controller: ReturnType<typeof useMisLicenciasPageController>;
}

export function MisLicenciasPageContent({ controller }: MisLicenciasPageContentProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', gap: 4, borderBottom: '1px solid', borderColor: 'divider', pb: 4 }}>
                <Box>
                    <Typography variant="overline" fontWeight={800} color="primary.main" sx={{ letterSpacing: '0.2em', mb: 1, display: 'block' }}>
                        Gestión de Personal
                    </Typography>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                        Mis Licencias
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                        Consulta el estado de tus permisos laborales, solicita nuevas ausencias y gestiona tus días disponibles con total transparencia.
                    </Typography>
                </Box>
                {controller.canSolicitarLicencia ? (
                    <Button
                        variant="contained"
                        onClick={() => controller.setDialogOpen(true)}
                        startIcon={<CheckCircleOutline sx={{ transform: 'rotate(45deg)' }} />}
                        sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                    >
                        Solicitar Licencia
                    </Button>
                ) : null}
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em' }}>Total de licencias</Typography>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.50', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FolderSharedIcon />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h3" fontWeight={800} color="text.primary">{controller.licenciaStats.total.toString().padStart(2, '0')}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Registros consultados con los filtros actuales
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
                                Pendientes visibles
                            </Typography>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'warning.50', color: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PendingActionsOutlined />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h3" fontWeight={800} color="text.primary">{controller.licenciaStats.pendingVisible.toString().padStart(2, '0')}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Pendientes en la pagina actual ({controller.licenciaStats.visibleCount} visibles)
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', borderLeft: '4px solid', borderLeftColor: 'success.main' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
                                Aprobadas visibles
                            </Typography>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'success.50', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <EventAvailableOutlined />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h3" fontWeight={800} color="text.primary">{controller.licenciaStats.approvedVisible.toString().padStart(2, '0')}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Aprobadas en la pagina actual
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 3, display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>TIPO DE LICENCIA</Typography>
                    <TextField
                        select
                        fullWidth
                        value={controller.tipoLicenciaID}
                        onChange={(event) => controller.setTipoLicenciaID(event.target.value === '' ? '' : Number(event.target.value))}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { border: 'none' } } }}
                    >
                        <MenuItem value="">Todos los tipos</MenuItem>
                        {(controller.tiposLicencia ?? []).map((tipo) => (
                            <MenuItem key={tipo.id} value={tipo.id}>{tipo.text}</MenuItem>
                        ))}
                    </TextField>
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>ESTADO</Typography>
                    <TextField
                        select
                        fullWidth
                        value={controller.estadoRevision}
                        onChange={(event) => controller.setEstadoRevision(event.target.value as typeof controller.estadoRevision)}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { border: 'none' } } }}
                    >
                        <MenuItem value="">Todos los estados</MenuItem>
                        <MenuItem value="pendiente">Pendiente</MenuItem>
                        <MenuItem value="aprobada">Aprobada</MenuItem>
                        <MenuItem value="rechazada">Rechazada</MenuItem>
                    </TextField>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 2, minWidth: 300 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>DESDE</Typography>
                        <TextField
                            fullWidth
                            type="date"
                            value={controller.desde}
                            onChange={(event) => controller.setDesde(event.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { border: 'none' } } }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, ml: 1 }}>HASTA</Typography>
                        <TextField
                            fullWidth
                            type="date"
                            value={controller.hasta}
                            onChange={(event) => controller.setHasta(event.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2, '& fieldset': { border: 'none' } } }}
                        />
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    onClick={controller.handleSearch}
                    sx={{ p: 1.5, minWidth: 48, borderRadius: 2, bgcolor: 'action.selected', color: 'text.primary', boxShadow: 'none', '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 'none' } }}
                >
                    <FilterListIcon />
                </Button>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                {isMobile ? (
                    <MisLicenciasMobileList
                        data={controller.data}
                        isLoading={controller.isLoading}
                        page={controller.page}
                        rowsPerPage={controller.rowsPerPage}
                        onPageChange={controller.handleChangePage}
                        onRowsPerPageChange={controller.handleChangeRowsPerPage}
                    />
                ) : (
                    <SharedTable
                        data={controller.data}
                        isLoading={controller.isLoading}
                        page={controller.page}
                        rowsPerPage={controller.rowsPerPage}
                        onPageChange={controller.handleChangePage}
                        onRowsPerPageChange={controller.handleChangeRowsPerPage}
                        columns={columns}
                        keyExtractor={(item) => item.colaboradorLicenciaId}
                        emptyMessage="No se encontraron licencias con los filtros seleccionados."
                        containerSx={portalTableContainerFlatSx}
                        headerSx={portalTableHeaderFlatSx}
                        variant="flat"
                        renderRow={(item) => {
                            const statusColor = getStatusColor(item);
                            const isApproved = item.estadoRevision === 'aprobada';
                            const isPending = item.estadoRevision === 'pendiente';

                            return (
                                <>
                                    <TableCell sx={{ py: 3, px: 4 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `${statusColor}.main` }} />
                                            <Typography variant="body2" fontWeight={600}>{item.tipoLicenciaNombre}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center" sx={{ py: 3, px: 3 }}>
                                        <Typography variant="body2" fontWeight={500}>{formatDateOnly(item.fechaInicial)}</Typography>
                                        {item.fechaFinal && (
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', fontSize: '11px' }}>
                                                AL {formatDateOnly(item.fechaFinal)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ py: 3, px: 3 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.descripcion || 'Sin descripción'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ py: 3, px: 3 }}>
                                        <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.5, borderRadius: 99, bgcolor: `${statusColor}.50`, color: `${statusColor}.dark`, border: '1px solid', borderColor: `${statusColor}.200` }}>
                                            <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '11px' }}>
                                                {isPending ? 'Pendiente' : isApproved ? 'Aprobada' : 'Rechazada'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 3, px: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.fechaAceptacion ? formatDateOnly(item.fechaAceptacion) : '—'}
                                        </Typography>
                                    </TableCell>
                                </>
                            );
                        }}
                    />
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 3, bgcolor: 'info.50', borderRadius: 3, border: '1px solid', borderColor: 'info.100' }}>
                <Box sx={{ bgcolor: 'info.main', color: 'info.contrastText', p: 0.5, borderRadius: 1, display: 'flex' }}>
                    <InfoIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="caption" fontWeight={800} color="info.dark" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nota Importante</Typography>
                    <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                        Las solicitudes de licencia deben presentarse con al menos 15 días de anticipación para asegurar la continuidad operativa de las rutas asignadas. Las licencias médicas deben adjuntar el certificado correspondiente en la sección de 'Mis Documentos'.
                    </Typography>
                </Box>
            </Box>

            <SolicitarLicenciaModal
                open={controller.dialogOpen}
                onClose={() => controller.setDialogOpen(false)}
            />
        </Box>
    );
}
