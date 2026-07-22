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
} from '@mui/icons-material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { formatDateOnly, formatDateTime } from '@shared/utils/date-utils';
import { getEstadoColor } from '@entities/employee/lib/status-utils';
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
];

interface MisDocumentosPageContentProps {
    controller: ReturnType<typeof useMisDocumentosPageController>;
}

export function MisDocumentosPageContent({ controller }: MisDocumentosPageContentProps) {
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

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'success.50', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <VerifiedIcon />
                        </Box>
                        <Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>Documentos Vigentes</Typography>
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
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>Próximos a Vencer</Typography>
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
                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block' }}>Pendientes Visibles</Typography>
                            <Typography variant="h5" fontWeight={800} color="text.primary">{controller.pendingRequestsVisible}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

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
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant={controller.activo === '' ? 'contained' : 'outlined'} onClick={() => controller.handleSearch({ activo: '' })} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Todos</Button>
                    <Button variant={controller.activo === 'true' ? 'contained' : 'outlined'} onClick={() => controller.handleSearch({ activo: 'true' })} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: controller.activo === 'true' ? undefined : 'text.secondary', borderColor: controller.activo === 'true' ? undefined : 'divider' }}>Activos</Button>
                    <Button variant={controller.activo === 'false' ? 'contained' : 'outlined'} onClick={() => controller.handleSearch({ activo: 'false' })} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: controller.activo === 'false' ? undefined : 'text.secondary', borderColor: controller.activo === 'false' ? undefined : 'divider' }}>Inactivos</Button>
                    <Button variant="outlined" onClick={() => controller.handleSearch()} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                        Aplicar
                    </Button>
                </Box>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: -2 }}>
                Los filtros se aplican sobre la consulta paginada del servidor.
            </Typography>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">Documentos Oficiales</Typography>
                    {controller.canRequestDocumentUpdate ? (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => { controller.setSelectedDocumentoId(undefined); controller.setDialogOpen(true); }}
                            sx={{ borderRadius: 2, boxShadow: 'none' }}
                        >
                            Nueva Solicitud
                        </Button>
                    ) : null}
                </Box>
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
                        renderRow={(item) => (
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
                                    <Box sx={{ display: 'inline-flex', px: 1, py: 0.5, borderRadius: 1, bgcolor: item.activo ? 'success.50' : 'error.50', color: item.activo ? 'success.main' : 'error.main' }}>
                                        <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                            {item.activo ? 'Activo' : 'Inactivo'}
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
                                                onClick={() => {
                                                    controller.setSelectedDocumentoId(item.colaboradorDocumentoId);
                                                    controller.setDialogOpen(true);
                                                }}
                                            >
                                                <SyncOutlined fontSize="small" />
                                            </Button>
                                        ) : null}
                                    </Box>
                                </TableCell>
                            </>
                        )}
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
                        controller.setSelectedDocumentoId(item.colaboradorDocumentoId);
                        controller.setDialogOpen(true);
                    }}
                />
            </Box>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">Historial de Solicitudes</Typography>
                </Box>
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
                                        <Typography variant="body2" fontWeight={600} color="text.primary">{controller.documentNameById.get(item.colaboradorDocumentoId) || `Documento #${item.colaboradorDocumentoId}`}</Typography>
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
                                </>
                            );
                        }}
                    />
                </Box>
                <MisDocumentoSolicitudesMobileList
                    data={controller.solicitudes}
                    isLoading={controller.isLoadingSolicitudes}
                    documentNameById={controller.documentNameById}
                    page={controller.requestPage}
                    rowsPerPage={controller.requestRowsPerPage}
                    onPageChange={controller.handleRequestPageChange}
                    onRowsPerPageChange={controller.handleRequestRowsPerPageChange}
                />
            </Box>

            <SolicitudActualizacionModal
                open={controller.dialogOpen}
                onClose={() => controller.setDialogOpen(false)}
                documentos={controller.documentosEnriquecidos}
                initialDocumentoId={controller.selectedDocumentoId}
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
