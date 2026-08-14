import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    MenuItem,
    TableCell,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    CancelOutlined,
    CheckCircleOutline,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import type { LicenciaSolicitudDto } from '@entities/licencia/model/types';
import { getEstadoColor } from '@shared/utils/status-utils';
import { formatDateOnly, formatDateTime } from '@shared/utils/date-utils';
import { RevisarSolicitudLicenciaModal } from './RevisarSolicitudLicenciaModal';
import type { EstadoRevisionFilter, useSolicitudesLicenciasPageController } from '../hooks/useSolicitudesLicenciasPageController';

const columns: Column[] = [
    { id: 'colaborador', label: 'Colaborador', minWidth: 180 },
    { id: 'tipo', label: 'Tipo', minWidth: 150 },
    { id: 'periodo', label: 'Periodo', minWidth: 170 },
    { id: 'descripcion', label: 'Descripción', minWidth: 170 },
    { id: 'estado', label: 'Estado', minWidth: 120 },
    { id: 'resolucion', label: 'Resolución', minWidth: 160 },
    { id: 'acciones', label: 'Acciones', align: 'right', width: 140 },
];

interface SolicitudesLicenciasPageContentProps {
    controller: ReturnType<typeof useSolicitudesLicenciasPageController>;
}

function EstadoRevisionChip({ solicitud }: { solicitud: LicenciaSolicitudDto }) {
    return (
        <Chip
            label={solicitud.estadoRevision}
            color={getEstadoColor(solicitud.aceptado)}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
        />
    );
}

export function SolicitudesLicenciasPageContent({ controller }: SolicitudesLicenciasPageContentProps) {
    const theme = useTheme();
    const items = controller.data?.items ?? [];
    const isRefreshing = controller.isFetching && !controller.isLoading;

    const renderReviewActions = (item: LicenciaSolicitudDto) => {
        if (item.aceptado != null) {
            return (
                <Tooltip title="Ver solicitud">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={(event) => { event.stopPropagation(); controller.handleOpenReview(item, 'view'); }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            );
        }

        if (!controller.canAprobarLicencias) {
            return null;
        }

        return (
            <>
                <Tooltip title="Aprobar">
                    <IconButton size="small" color="success" onClick={(event) => { event.stopPropagation(); controller.handleOpenReview(item, 'approve'); }}>
                        <CheckCircleOutline fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Rechazar">
                    <IconButton size="small" color="error" onClick={(event) => { event.stopPropagation(); controller.handleOpenReview(item, 'reject'); }}>
                        <CancelOutlined fontSize="small" />
                    </IconButton>
                </Tooltip>
            </>
        );
    };

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
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.02em' }}>
                        Solicitudes de Licencias
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Revise y apruebe o rechace las solicitudes de licencia de los colaboradores
                    </Typography>
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
                    <Box sx={{ flex: 1, minWidth: '220px' }}>
                        <TextField
                            placeholder="Buscar por colaborador..."
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
                    <TextField
                        select
                        size="small"
                        label="Estado"
                        value={controller.estadoRevision}
                        onChange={(event) => controller.handleEstadoRevisionChange(event.target.value as EstadoRevisionFilter)}
                        sx={{ minWidth: { xs: '100%', sm: 180 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="pendiente">Pendientes</MenuItem>
                        <MenuItem value="aprobada">Aprobadas</MenuItem>
                        <MenuItem value="rechazada">Rechazadas</MenuItem>
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Tipo de licencia"
                        value={controller.tipoLicenciaID}
                        onChange={(event) => controller.handleTipoLicenciaChange(event.target.value === '' ? '' : Number(event.target.value))}
                        sx={{ minWidth: { xs: '100%', sm: 220 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                        <MenuItem value="">Todos los tipos</MenuItem>
                        {(controller.tiposLicencia ?? []).map((tipo) => (
                            <MenuItem key={tipo.id} value={tipo.id}>
                                {tipo.text}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {controller.hasBlockingError ? (
                    <FetchErrorState
                        message="No se pudieron cargar las solicitudes de licencias."
                        onRetry={controller.retryLoad}
                    />
                ) : (
                    <>
                        {isRefreshing ? (
                            <Typography variant="caption" color="text.secondary">
                                Actualizando solicitudes según los filtros aplicados...
                            </Typography>
                        ) : null}

                        <SharedTable
                            data={controller.data}
                            isLoading={controller.isLoading}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            columns={columns}
                            keyExtractor={(item) => item.colaboradorLicenciaId}
                            emptyMessage="No se encontraron solicitudes con los filtros seleccionados."
                            renderRow={(item) => (
                                <>
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight={700}>
                                            {item.colaboradorNombre}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.tipoLicenciaNombre}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {formatDateOnly(item.fechaInicial)}
                                        </Typography>
                                        {item.fechaFinal ? (
                                            <Typography variant="caption" color="text.secondary">
                                                al {formatDateOnly(item.fechaFinal)}
                                            </Typography>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {item.descripcion || 'Sin descripción'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <EstadoRevisionChip solicitud={item} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.fechaAceptacion ? formatDateOnly(item.fechaAceptacion) : '—'}
                                        </Typography>
                                        {item.comentarioRevision ? (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.comentarioRevision}
                                            </Typography>
                                        ) : null}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                            {renderReviewActions(item)}
                                        </Box>
                                    </TableCell>
                                </>
                            )}
                        />

                        <MobileListShell
                            items={items}
                            total={controller.data?.total ?? 0}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            emptyMessage="No se encontraron solicitudes con los filtros seleccionados."
                            keyExtractor={(item) => item.colaboradorLicenciaId}
                            renderHeader={(item) => (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {item.colaboradorNombre}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.tipoLicenciaNombre}
                                        </Typography>
                                    </Box>
                                    <EstadoRevisionChip solicitud={item} />
                                </Box>
                            )}
                            renderBody={(item) => (
                                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Periodo: {formatDateOnly(item.fechaInicial)}
                                        {item.fechaFinal ? ` al ${formatDateOnly(item.fechaFinal)}` : ''}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Solicitado: {formatDateTime(item.fechaRegistro)}
                                    </Typography>
                                    {item.descripcion ? (
                                        <Typography variant="caption" color="text.secondary">
                                            Motivo: {item.descripcion}
                                        </Typography>
                                    ) : null}
                                    {item.fechaAceptacion ? (
                                        <Typography variant="caption" color="text.secondary">
                                            Resolución: {formatDateOnly(item.fechaAceptacion)}
                                            {item.comentarioRevision ? ` — ${item.comentarioRevision}` : ''}
                                        </Typography>
                                    ) : null}
                                    {item.aceptado != null ? (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => controller.handleOpenReview(item, 'view')}
                                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Ver detalle
                                        </Button>
                                    ) : controller.canAprobarLicencias ? (
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckCircleOutline />}
                                                onClick={() => controller.handleOpenReview(item, 'approve')}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                                            >
                                                Aprobar
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                startIcon={<CancelOutlined />}
                                                onClick={() => controller.handleOpenReview(item, 'reject')}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                                            >
                                                Rechazar
                                            </Button>
                                        </Box>
                                    ) : null}
                                </Box>
                            )}
                        />
                    </>
                )}
            </Box>

            <RevisarSolicitudLicenciaModal
                target={controller.reviewTarget}
                isProcessing={controller.isProcessingReview}
                onClose={controller.handleCloseReview}
                onSubmit={controller.handleSubmitReview}
            />
        </Box>
    );
}
