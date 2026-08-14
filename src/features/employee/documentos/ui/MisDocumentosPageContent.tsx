import {
    Box,
    Button,
    Grid,
    MenuItem,
    TableCell,
    TextField,
    Typography,
} from '@mui/material';
import {
    PendingActionsOutlined,
    SyncOutlined,
    VisibilityOutlined,
    WarningAmberOutlined,
    Download as DownloadIcon,
    Verified as VerifiedIcon,
    ChevronRight as ChevronRightIcon,
    Add as AddIcon,
    EditOutlined,
    DeleteOutline,
} from '@mui/icons-material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { FetchErrorState } from '@shared/components/ui/FetchErrorState';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { formatDateOnly, formatDateTime } from '@shared/utils/date-utils';
import { getEstadoColor } from '@shared/utils/status-utils';
import { getDocumentVigenciaMeta } from '@shared/utils/document-vigencia';
import { SolicitudActualizacionModal } from './SolicitudActualizacionModal';
import {
    MisDocumentosMobileList,
    MisDocumentoSolicitudesMobileList,
} from './MisDocumentosMobileLists';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { portalTableContainerFlatSx, portalTableHeaderFlatSx } from '@shared/components/ui/employee-portal-shell.styles';
import type { useMisDocumentosPageController } from '../hooks/useMisDocumentosPageController';

const documentColumns: Column[] = [
    { id: 'documento', label: 'Documento' },
    { id: 'numero', label: 'Número' },
    { id: 'emision', label: 'Emisión' },
    { id: 'vencimiento', label: 'Vencimiento' },
    { id: 'estado', label: 'Estado' },
    { id: 'acciones', label: 'Acciones', align: 'right' },
];

const requestColumns: Column[] = [
    { id: 'documento', label: 'Documento' },
    { id: 'fecha', label: 'Fecha Solicitud' },
    { id: 'motivo', label: 'Motivo' },
    { id: 'estado', label: 'Estado Revisión' },
    { id: 'acciones', label: 'Acciones', align: 'right' },
];

interface MisDocumentosPageContentProps {
    controller: ReturnType<typeof useMisDocumentosPageController>;
}

export function MisDocumentosPageContent({ controller }: MisDocumentosPageContentProps) {
    const isRefreshingDocumentos = controller.isFetchingDocumentos && !controller.isLoadingDocumentos;
    const isRefreshingSolicitudes = controller.isFetchingSolicitudes && !controller.isLoadingSolicitudes;
    const hasBlockingKpiError = controller.hasBlockingDocumentosError || controller.hasBlockingSolicitudesError;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, minHeight: '100%', flex: '1 0 auto' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: 'space-between', gap: 4, borderBottom: '1px solid', borderColor: 'divider', pb: 4 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inicio</Typography>
                        <ChevronRightIcon fontSize="small" color="action" />
                        <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Mis Documentos</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                        Mis Documentos
                    </Typography>
                </Box>
            </Box>

            {hasBlockingKpiError ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {controller.hasBlockingDocumentosError ? (
                        <FetchErrorState
                            message="No se pudieron cargar tus documentos del portal del empleado."
                            onRetry={controller.retryDocumentosLoad}
                        />
                    ) : null}
                    {controller.hasBlockingSolicitudesError ? (
                        <FetchErrorState
                            message="No se pudo cargar el historial de solicitudes de actualización."
                            onRetry={controller.retrySolicitudesLoad}
                        />
                    ) : null}
                </Box>
            ) : (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'success.50', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <VerifiedIcon />
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>
                                    {isRefreshingDocumentos ? 'Actualizando vigencia' : 'Vigentes Visibles'}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="text.primary">{controller.documentStats.vigentes}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'error.50', color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <WarningAmberOutlined />
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>
                                    {isRefreshingDocumentos ? 'Actualizando alertas' : 'Por Vencer Visibles'}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="text.primary">{controller.documentStats.nearExpiry}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PendingActionsOutlined />
                            </Box>
                            <Box>
                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>
                                    {isRefreshingSolicitudes ? 'Actualizando historial' : 'Pendientes Visibles'}
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="text.primary">{controller.pendingRequestsVisible}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            )}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <TextField
                    select
                    size="small"
                    value={controller.tipoDocumentoID}
                    onChange={(event) => controller.setTipoDocumentoID(event.target.value === '' ? '' : Number(event.target.value))}
                    label="Tipo de documento"
                    sx={{ width: { xs: '100%', md: 384 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
                >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    {(controller.tiposDocumento ?? []).map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                            {tipo.text}
                        </MenuItem>
                    ))}
                </TextField>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'stretch', md: 'flex-end' }, gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Estado administrativo
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Button variant={controller.activo === '' ? 'contained' : 'outlined'} onClick={() => controller.handleSearch({ activo: '' })} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Todos</Button>
                    <Button variant={controller.activo === 'true' ? 'contained' : 'outlined'} onClick={() => controller.handleSearch({ activo: 'true' })} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: controller.activo === 'true' ? undefined : 'text.secondary', borderColor: controller.activo === 'true' ? undefined : 'divider' }}>Admin. activos</Button>
                    <Button variant={controller.activo === 'false' ? 'contained' : 'outlined'} onClick={() => controller.handleSearch({ activo: 'false' })} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: controller.activo === 'false' ? undefined : 'text.secondary', borderColor: controller.activo === 'false' ? undefined : 'divider' }}>Admin. inactivos</Button>
                    <Button variant="outlined" onClick={() => controller.handleSearch()} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                        Aplicar
                    </Button>
                    </Box>
                </Box>
            </Box>

            {!hasBlockingKpiError ? (
                <Typography variant="caption" color="text.secondary" sx={{ mt: -2 }}>
                    {isRefreshingDocumentos || isRefreshingSolicitudes
                        ? 'Estamos actualizando la consulta del portal empleado.'
                        : 'La vigencia visible se muestra por documento. El filtro de estado administrativo opera sobre `activo` y los KPI corresponden a la consulta cargada.'}
                </Typography>
            ) : null}

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">Documentos Oficiales</Typography>
                    {controller.canRequestDocumentUpdate ? (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => controller.handleOpenCreateSolicitud()}
                            disabled={isRefreshingDocumentos}
                            sx={{ borderRadius: 2, boxShadow: 'none' }}
                        >
                            Nueva Solicitud
                        </Button>
                    ) : null}
                </Box>
                {isRefreshingDocumentos ? (
                    <Box sx={{ px: 3, py: 1.5, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>
                        Actualizando documentos segun los filtros aplicados...
                    </Box>
                ) : null}
                {controller.hasBlockingDocumentosError ? (
                    <Box sx={{ p: 3 }}>
                        <FetchErrorState
                            message="No se pudieron cargar tus documentos del portal del empleado."
                            onRetry={controller.retryDocumentosLoad}
                        />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <SharedTable
                                data={controller.documentos}
                                isLoading={controller.isLoadingDocumentos}
                                page={controller.page}
                                rowsPerPage={controller.rowsPerPage}
                                onPageChange={controller.handleChangePage}
                                onRowsPerPageChange={controller.handleChangeRowsPerPage}
                                columns={documentColumns}
                                keyExtractor={(item) => item.colaboradorDocumentoId}
                                emptyMessage="No se encontraron documentos con los filtros seleccionados."
                                containerSx={portalTableContainerFlatSx}
                                headerSx={portalTableHeaderFlatSx}
                                variant="flat"
                                renderRow={(item) => {
                                    const vigencia = getDocumentVigenciaMeta(item.vigenciaEstado);

                                    return (
                                        <>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">{item.tipoDocumentoNombre}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" color="text.secondary">{item.numeroDocumento || '—'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" color="text.secondary">{formatDateOnly(item.fechaEmision)}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" color="text.secondary">{formatDateOnly(item.fechaVencimiento)}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Box sx={{ display: 'inline-flex', px: 1, py: 0.5, borderRadius: 1, bgcolor: vigencia.bgColor, color: vigencia.textColor }}>
                                                    <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                                        {vigencia.label}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2, px: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Button sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => controller.handleOpenDocument(item)}>
                                                        <VisibilityOutlined fontSize="small" />
                                                    </Button>
                                                    <Button sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => controller.handleDownloadDocument(item)}>
                                                        <DownloadIcon fontSize="small" />
                                                    </Button>
                                                    {controller.canRequestDocumentUpdate ? (
                                                        <Button
                                                            sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                                            onClick={() => controller.handleOpenCreateSolicitud(item.colaboradorDocumentoId)}
                                                        >
                                                            <SyncOutlined fontSize="small" />
                                                        </Button>
                                                    ) : null}
                                                </Box>
                                            </TableCell>
                                        </>
                                    );
                                }}
                            />
                        </Box>
                        <MisDocumentosMobileList
                            isLoading={controller.isLoadingDocumentos}
                            data={controller.documentos}
                            page={controller.page}
                            rowsPerPage={controller.rowsPerPage}
                            onPageChange={controller.handleChangePage}
                            onRowsPerPageChange={controller.handleChangeRowsPerPage}
                            canRequestDocumentUpdate={controller.canRequestDocumentUpdate}
                            onOpenDocument={controller.handleOpenDocument}
                            onDownloadDocument={controller.handleDownloadDocument}
                            onRequestUpdate={(item) => {
                                controller.handleOpenCreateSolicitud(item.colaboradorDocumentoId);
                            }}
                        />
                    </>
                )}
            </Box>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">Historial de Solicitudes</Typography>
                </Box>
                {isRefreshingSolicitudes ? (
                    <Box sx={{ px: 3, py: 1.5, bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 600 }}>
                        Actualizando historial de solicitudes...
                    </Box>
                ) : null}
                {controller.hasBlockingSolicitudesError ? (
                    <Box sx={{ p: 3 }}>
                        <FetchErrorState
                            message="No se pudo cargar el historial de solicitudes de actualización."
                            onRetry={controller.retrySolicitudesLoad}
                        />
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <SharedTable
                                data={controller.solicitudes}
                                isLoading={controller.isLoadingSolicitudes}
                                page={controller.requestPage}
                                rowsPerPage={controller.requestRowsPerPage}
                                onPageChange={controller.handleRequestPageChange}
                                onRowsPerPageChange={controller.handleRequestRowsPerPageChange}
                                columns={requestColumns}
                                keyExtractor={(item) => item.solicitudId}
                                emptyMessage="Aún no tienes solicitudes de actualización."
                                containerSx={portalTableContainerFlatSx}
                                headerSx={portalTableHeaderFlatSx}
                                variant="flat"
                                renderRow={(item) => {
                                    const statusColor = getEstadoColor(item.aprobada);

                                    return (
                                        <>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">{item.tipoDocumentoNombre}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" color="text.secondary">{formatDateTime(item.fechaRegistro)}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Typography variant="body2" color="text.secondary">{item.motivoSolicitud || 'Sin motivo'}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2, px: 3 }}>
                                                <Box sx={{ display: 'inline-flex', px: 1, py: 0.5, borderRadius: 1, bgcolor: `${statusColor}.50`, color: `${statusColor}.main` }}>
                                                    <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                                        {item.estadoRevision}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 2, px: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    {controller.canRequestDocumentUpdate ? (
                                                        <>
                                                            {controller.canEditSolicitud(item) ? (
                                                                <Button sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => controller.handleEditSolicitud(item)}>
                                                                    <EditOutlined fontSize="small" />
                                                                </Button>
                                                            ) : null}
                                                            {controller.canDeleteSolicitud(item) ? (
                                                                <Button sx={{ minWidth: 'auto', p: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => controller.handleDeleteSolicitud(item)}>
                                                                    <DeleteOutline fontSize="small" />
                                                                </Button>
                                                            ) : null}
                                                        </>
                                                    ) : null}
                                                </Box>
                                            </TableCell>
                                        </>
                                    );
                                }}
                            />
                        </Box>
                        <MisDocumentoSolicitudesMobileList
                            data={controller.solicitudes}
                            isLoading={controller.isLoadingSolicitudes}
                            page={controller.requestPage}
                            rowsPerPage={controller.requestRowsPerPage}
                            onPageChange={controller.handleRequestPageChange}
                            onRowsPerPageChange={controller.handleRequestRowsPerPageChange}
                            onEdit={controller.handleEditSolicitud}
                            onDelete={controller.handleDeleteSolicitud}
                            canEdit={controller.canEditSolicitud}
                            canDelete={controller.canDeleteSolicitud}
                        />
                    </>
                )}
            </Box>

            <SolicitudActualizacionModal
                open={controller.dialogOpen}
                onClose={() => controller.setDialogOpen(false)}
                documentos={controller.documentosEnriquecidos}
                initialDocumentoId={controller.selectedDocumentoId}
                solicitud={controller.editandoSolicitud}
                onUpdate={controller.handleUpdateSolicitud}
                isUpdating={controller.updateSolicitudMutation.isPending}
            />

            <ConfirmDialog
                open={Boolean(controller.deleteTarget)}
                title="Eliminar solicitud"
                content={controller.deleteTarget ? `¿Seguro que deseas eliminar la solicitud de actualización del documento ${controller.deleteTarget.tipoDocumentoNombre}? Esta acción no se puede deshacer.` : ''}
                confirmText="Eliminar"
                cancelText="Cancelar"
                severity="error"
                isLoading={controller.deleteSolicitudMutation.isPending}
                onConfirm={controller.confirmDeleteSolicitud}
                onClose={() => controller.setDeleteTarget(null)}
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
