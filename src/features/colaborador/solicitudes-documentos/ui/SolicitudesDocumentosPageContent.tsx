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
    VisibilityOutlined,
} from '@mui/icons-material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import type { ColaboradorDocumentoSolicitud } from '@entities/colaborador-documento/model/types';
import { getEstadoColor } from '@entities/employee/lib/status-utils';
import { formatDateLong, formatDateTime } from '@shared/utils/date-utils';
import { RevisarSolicitudModal } from './RevisarSolicitudModal';
import type { EstadoRevisionFilter, useSolicitudesDocumentosPageController } from '../hooks/useSolicitudesDocumentosPageController';

const columns: Column[] = [
    { id: 'colaborador', label: 'Colaborador', minWidth: 180 },
    { id: 'tipoDocumento', label: 'Tipo Documento', minWidth: 150 },
    { id: 'actual', label: 'Documento Actual', minWidth: 170 },
    { id: 'propuesta', label: 'Propuesta', minWidth: 170 },
    { id: 'fechaSolicitud', label: 'Fecha Solicitud', minWidth: 150 },
    { id: 'estado', label: 'Estado', minWidth: 120 },
    { id: 'acciones', label: 'Acciones', align: 'right', width: 160 },
];

interface SolicitudesDocumentosPageContentProps {
    controller: ReturnType<typeof useSolicitudesDocumentosPageController>;
}

function EstadoRevisionChip({ solicitud }: { solicitud: ColaboradorDocumentoSolicitud }) {
    return (
        <Chip
            label={solicitud.estadoRevision}
            color={getEstadoColor(solicitud.aprobada)}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, textTransform: 'capitalize' }}
        />
    );
}

export function SolicitudesDocumentosPageContent({ controller }: SolicitudesDocumentosPageContentProps) {
    const theme = useTheme();
    const items = controller.data?.items ?? [];
    const isRefreshing = controller.isFetching && !controller.isLoading;

    const renderReviewActions = (item: ColaboradorDocumentoSolicitud) => {
        if (item.aprobada != null || !controller.canGestionarSolicitudes) {
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
                        Solicitudes de Documentos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Revise y gestione las solicitudes de actualización documental de los colaboradores
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
                            placeholder="Buscar por colaborador o número de documento..."
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
                        label="Tipo de documento"
                        value={controller.tipoDocumentoID}
                        onChange={(event) => controller.handleTipoDocumentoChange(event.target.value === '' ? '' : Number(event.target.value))}
                        sx={{ minWidth: { xs: '100%', sm: 220 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                        <MenuItem value="">Todos los tipos</MenuItem>
                        {(controller.tiposDocumento ?? []).map((tipo) => (
                            <MenuItem key={tipo.id} value={tipo.id}>
                                {tipo.text}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {controller.hasBlockingError ? (
                    <FetchErrorState
                        message="No se pudieron cargar las solicitudes de actualización de documentos."
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
                            keyExtractor={(item) => item.solicitudId}
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
                                            {item.tipoDocumentoNombre}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {item.numeroDocumentoActual || '—'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Vence: {item.fechaVencimientoActual ? formatDateLong(item.fechaVencimientoActual) : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {item.numeroDocumentoPropuesto || '—'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Vence: {item.fechaVencimientoPropuesta ? formatDateLong(item.fechaVencimientoPropuesta) : '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDateTime(item.fechaRegistro)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <EstadoRevisionChip solicitud={item} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                            {item.rutaArchivoPropuesta ? (
                                                <Tooltip title="Ver archivo propuesto">
                                                    <IconButton size="small" onClick={(event) => { event.stopPropagation(); void controller.handlePreviewArchivo(item); }}>
                                                        <VisibilityOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : null}
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
                            keyExtractor={(item) => item.solicitudId}
                            renderHeader={(item) => (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {item.colaboradorNombre}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.tipoDocumentoNombre}
                                        </Typography>
                                    </Box>
                                    <EstadoRevisionChip solicitud={item} />
                                </Box>
                            )}
                            renderBody={(item) => (
                                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Box sx={{ flex: 1, minWidth: 120 }}>
                                            <Typography variant="caption" color="text.secondary">Actual</Typography>
                                            <Typography variant="body2" fontWeight={500}>{item.numeroDocumentoActual || '—'}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Vence: {item.fechaVencimientoActual ? formatDateLong(item.fechaVencimientoActual) : '—'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 120 }}>
                                            <Typography variant="caption" color="text.secondary">Propuesta</Typography>
                                            <Typography variant="body2" fontWeight={500}>{item.numeroDocumentoPropuesto || '—'}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Vence: {item.fechaVencimientoPropuesta ? formatDateLong(item.fechaVencimientoPropuesta) : '—'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Solicitado: {formatDateTime(item.fechaRegistro)}
                                    </Typography>
                                    {item.motivoSolicitud ? (
                                        <Typography variant="caption" color="text.secondary">
                                            Motivo: {item.motivoSolicitud}
                                        </Typography>
                                    ) : null}
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                        {item.rutaArchivoPropuesta ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<VisibilityOutlined />}
                                                onClick={() => void controller.handlePreviewArchivo(item)}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Ver archivo
                                            </Button>
                                        ) : null}
                                        {item.aprobada == null && controller.canGestionarSolicitudes ? (
                                            <>
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
                                            </>
                                        ) : null}
                                    </Box>
                                </Box>
                            )}
                        />
                    </>
                )}
            </Box>

            <RevisarSolicitudModal
                target={controller.reviewTarget}
                isProcessing={controller.isProcessingReview}
                onClose={controller.handleCloseReview}
                onSubmit={controller.handleSubmitReview}
                onPreviewFile={(solicitud) => void controller.handlePreviewArchivo(solicitud)}
            />

            <DocumentPreviewDialog
                open={Boolean(controller.previewUrl)}
                onClose={() => controller.setPreviewUrl(null)}
                previewUrl={controller.previewUrl}
                title={controller.previewTitle}
            />
        </Box>
    );
}
