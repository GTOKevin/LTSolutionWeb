import {
    Box,
    Button,
    Grid,
    IconButton,
    MenuItem,
    TableCell,
    TextField,
    Tooltip,
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
    CancelOutlined,
    ZoomIn as ZoomInIcon,
    Visibility as VisibilityIcon,
    EditOutlined,
} from '@mui/icons-material';
import { useState } from 'react';
import { SolicitarLicenciaModal } from './SolicitarLicenciaModal';
import { MisLicenciasDetailModal } from './MisLicenciasDetailModal';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { FileThumbnail } from '@shared/components/ui/FileThumbnail';
import { portalTableContainerFlatSx, portalTableHeaderFlatSx } from '@shared/components/ui/employee-portal-shell.styles';
import { MisLicenciasMobileList } from './MisLicenciasMobileList';
import type { MiLicenciaDto } from '@entities/employee/model/types';
import { formatDateOnly } from '@shared/utils/date-utils';
import { buildInternalFileUrl } from '@/shared/config/env';
import type { useMisLicenciasPageController } from '../hooks/useMisLicenciasPageController';

const columns: Column[] = [
    { id: 'tipo', label: 'TIPO' },
    { id: 'periodo', label: 'PERIODO', align: 'center' },
    { id: 'descripcion', label: 'DESCRIPCIÓN' },
    { id: 'adjuntos', label: 'ADJUNTOS', align: 'center' },
    { id: 'estado', label: 'ESTADO' },
    { id: 'resolucion', label: 'RESOLUCIÓN', align: 'right' },
    { id: 'acciones', label: '', align: 'right', width: 140 },
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
    const isRefreshing = controller.isFetching && !controller.isLoading;

    const [preview, setPreview] = useState<{
        previewUrl: string | null;
        previewUrls: string[];
        currentIndex: number;
    }>({
        previewUrl: null,
        previewUrls: [],
        currentIndex: 0,
    });

    const handlePreviewRutas = (rutas: string[], index: number) => {
        const previewUrls = rutas
            .map((ruta) => buildInternalFileUrl(ruta))
            .filter((url): url is string => Boolean(url));

        setPreview({
            previewUrl: previewUrls[index] ?? previewUrls[0] ?? null,
            previewUrls,
            currentIndex: index,
        });
    };

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
                <Button
                    variant="contained"
                    onClick={() => controller.setDialogOpen(true)}
                    startIcon={<CheckCircleOutline sx={{ transform: 'rotate(45deg)' }} />}
                    sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700, boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
                >
                    Solicitar Licencia
                </Button>
            </Box>

            {controller.hasBlockingError ? (
                <FetchErrorState
                    message="No se pudieron cargar tus licencias del portal del empleado."
                    onRetry={controller.retryLicenciasLoad}
                />
            ) : (
                <>
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
                                        {isRefreshing ? 'Actualizando resultados...' : 'Registros consultados con los filtros actuales'}
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
                                        {isRefreshing
                                            ? 'Actualizando licencias visibles...'
                                            : `Pendientes en la consulta visible (${controller.licenciaStats.visibleCount} registros)`}
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
                                        {isRefreshing ? 'Actualizando aprobaciones...' : 'Aprobadas en la consulta visible'}
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

                    {isRefreshing ? (
                        <Box sx={{ px: 2.5, py: 1.5, borderRadius: 3, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>
                            Actualizando licencias segun los filtros aplicados...
                        </Box>
                    ) : null}

                    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        {isMobile ? (
                            <MisLicenciasMobileList
                                data={controller.data}
                                isLoading={controller.isLoading}
                                page={controller.page}
                                rowsPerPage={controller.rowsPerPage}
                                onPageChange={controller.handleChangePage}
                                onRowsPerPageChange={controller.handleChangeRowsPerPage}
                                onCancel={controller.handleOpenCancel}
                                canCancel={controller.canCancel}
                                onEdit={controller.handleOpenEdit}
                                canEdit={controller.canEdit}
                                onViewDetail={controller.handleOpenDetail}
                                onPreviewImages={handlePreviewRutas}
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
                                            <TableCell align="center" sx={{ py: 3, px: 3 }}>
                                                {item.rutasFoto && item.rutasFoto.length > 0 ? (
                                                    <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'center' }}>
                                                        {item.rutasFoto.slice(0, 3).map((ruta, index) => {
                                                            const imageUrl = buildInternalFileUrl(ruta);
                                                            if (!imageUrl) {
                                                                return null;
                                                            }

                                                            return (
                                                                <Box
                                                                    key={`${item.colaboradorLicenciaId}-${ruta}-${index}`}
                                                                    onClick={() => handlePreviewRutas(item.rutasFoto, index)}
                                                                    sx={{
                                                                        width: 40,
                                                                        height: 40,
                                                                        borderRadius: 1.5,
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        overflow: 'hidden',
                                                                        bgcolor: 'grey.100',
                                                                        cursor: 'zoom-in',
                                                                        position: 'relative',
                                                                        '&:hover .thumb-zoom': { opacity: 1 },
                                                                    }}
                                                                >
                                                                    <FileThumbnail
                                                                        fileUrl={imageUrl}
                                                                        alt={`Adjunto ${index + 1}`}
                                                                        imageObjectFit="cover"
                                                                        showFileLabel
                                                                    />
                                                                    <Box className="thumb-zoom" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                                                                        <ZoomInIcon sx={{ color: 'white', fontSize: 18 }} />
                                                                    </Box>
                                                                </Box>
                                                            );
                                                        })}
                                                        {item.rutasFoto.length > 3 && (
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: 1.5,
                                                                    border: '1px dashed',
                                                                    borderColor: 'divider',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    bgcolor: 'action.hover',
                                                                }}
                                                            >
                                                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                                    +{item.rutasFoto.length - 3}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">—</Typography>
                                                )}
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
                                                {item.comentarioRevision ? (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', fontSize: '11px', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.comentarioRevision}
                                                    </Typography>
                                                ) : null}
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 3, px: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                                                    {item.aceptado != null ? (
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton size="small" onClick={() => controller.handleOpenDetail(item)}>
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ) : null}
                                                    {item.aceptado === null ? (
                                                        <>
                                                            <Tooltip title="Editar">
                                                                <IconButton size="small" onClick={() => controller.handleOpenEdit(item)}>
                                                                    <EditOutlined fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="warning"
                                                                startIcon={<CancelOutlined />}
                                                                onClick={() => controller.handleOpenCancel(item)}
                                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                                            >
                                                                Cancelar
                                                            </Button>
                                                        </>
                                                    ) : null}
                                                </Box>
                                            </TableCell>
                                        </>
                                    );
                                }}
                            />
                        )}
                    </Box>

                </>
            )}

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 3, bgcolor: 'info.50', borderRadius: 3, border: '1px solid', borderColor: 'info.100' }}>
                <Box sx={{ bgcolor: 'info.main', color: 'info.contrastText', p: 0.5, borderRadius: 1, display: 'flex' }}>
                    <InfoIcon fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="caption" fontWeight={800} color="info.dark" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Nota Importante</Typography>
                    <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                        Esta solicitud registra el periodo y el motivo de tu ausencia. La evaluación, aprobación y cualquier sustento adicional se gestionan durante la revisión interna según la política vigente de la empresa.
                    </Typography>
                </Box>
            </Box>

            <SolicitarLicenciaModal
                open={controller.dialogOpen}
                onClose={() => {
                    controller.setDialogOpen(false);
                    controller.handleCloseEdit();
                }}
                editing={controller.editTarget}
                editPending={controller.editPending}
                onEditSubmit={(id, payload) => controller.editMutation.mutate({ id, payload })}
            />

            <MisLicenciasDetailModal
                target={controller.detailTarget}
                onClose={controller.handleCloseDetail}
            />

            <DocumentPreviewDialog
                open={!!preview.previewUrl}
                onClose={() => setPreview({ previewUrl: null, previewUrls: [], currentIndex: 0 })}
                previewUrl={preview.previewUrl}
                previewUrls={preview.previewUrls}
                initialIndex={preview.currentIndex}
                title="Adjuntos de la licencia"
            />

            <ConfirmDialog
                open={Boolean(controller.cancelTarget)}
                title="Cancelar Licencia"
                content={
                    controller.cancelTarget ? (
                        <>
                            ¿Estás seguro de cancelar la solicitud de{' '}
                            <strong>{controller.cancelTarget.tipoLicenciaNombre}</strong> del{' '}
                            {formatDateOnly(controller.cancelTarget.fechaInicial)}
                            {controller.cancelTarget.fechaFinal ? ` al ${formatDateOnly(controller.cancelTarget.fechaFinal)}` : ''}?
                            Esta acción no se puede deshacer.
                        </>
                    ) : null
                }
                confirmText="Sí, cancelar"
                cancelText="Mantener"
                severity="warning"
                isLoading={controller.cancelPending}
                onConfirm={controller.handleConfirmCancel}
                onClose={controller.handleCloseCancel}
            />
        </Box>
    );
}
