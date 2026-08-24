import { Box, Button, Stack, Typography } from '@mui/material';
import {
    Download as DownloadIcon,
    SyncOutlined,
    VisibilityOutlined,
    EditOutlined,
    DeleteOutline,
} from '@mui/icons-material';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { formatDateOnly, formatDateTime } from '@shared/utils/date-utils';
import type { PagedResponse } from '@shared/model/types';
import { getDocumentVigenciaMeta } from '@shared/utils/document-vigencia';
import type {
    DocumentoActualizacionSolicitudDto,
    MiDocumentoDto,
} from '@entities/employee/model/types';

interface MisDocumentosMobileListProps {
    data?: PagedResponse<MiDocumentoDto>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOpenDocument: (item: MiDocumentoDto) => void;
    onDownloadDocument: (item: MiDocumentoDto) => void;
    onRequestUpdate?: (item: MiDocumentoDto) => void;
}

interface MisDocumentoSolicitudesMobileListProps {
    data?: PagedResponse<DocumentoActualizacionSolicitudDto>;
    isLoading: boolean;
    page: number;
    rowsPerPage: number;
    onPageChange: (event: unknown, newPage: number) => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEdit?: (item: DocumentoActualizacionSolicitudDto) => void;
    onDelete?: (item: DocumentoActualizacionSolicitudDto) => void;
    canEdit?: (item: DocumentoActualizacionSolicitudDto) => boolean;
    canDelete?: (item: DocumentoActualizacionSolicitudDto) => boolean;
}

export function MisDocumentosMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onOpenDocument,
    onDownloadDocument,
    onRequestUpdate,
}: MisDocumentosMobileListProps) {
    if (isLoading) {
        return <Box sx={{ display: { xs: 'block', md: 'none' }, p: 4, textAlign: 'center' }}>Cargando documentos...</Box>;
    }

    return (
        <MobileListShell
            items={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            emptyMessage="No se encontraron documentos con los filtros seleccionados."
            keyExtractor={(item) => item.colaboradorDocumentoId}
            renderHeader={(item) => {
                const vigencia = getDocumentVigenciaMeta(item.vigenciaEstado);

                return (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {item.tipoDocumentoNombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {item.numeroDocumento || 'Sin número'}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 99,
                                bgcolor: vigencia.bgColor,
                                color: vigencia.textColor,
                                height: 'fit-content',
                            }}
                        >
                            <Typography variant="caption" fontWeight={700}>
                                {vigencia.label}
                            </Typography>
                        </Box>
                    </Box>
                );
            }}
            renderBody={(item) => (
                <Stack spacing={1.25}>
                    <Typography variant="body2" color="text.secondary">
                        Emisión: {formatDateOnly(item.fechaEmision)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vencimiento: {formatDateOnly(item.fechaVencimiento)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityOutlined />}
                            onClick={() => onOpenDocument(item)}
                            sx={{ borderRadius: 2 }}
                        >
                            Ver
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => onDownloadDocument(item)}
                            sx={{ borderRadius: 2 }}
                        >
                            Descargar
                        </Button>
                        {onRequestUpdate ? (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<SyncOutlined />}
                                onClick={() => onRequestUpdate(item)}
                                sx={{ borderRadius: 2, boxShadow: 'none' }}
                            >
                                Actualizar
                            </Button>
                        ) : null}
                    </Box>
                </Stack>
            )}
        />
    );
}

export function MisDocumentoSolicitudesMobileList({
    data,
    isLoading,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    onEdit,
    onDelete,
    canEdit,
    canDelete,
}: MisDocumentoSolicitudesMobileListProps) {
    if (isLoading) {
        return <Box sx={{ display: { xs: 'block', md: 'none' }, p: 4, textAlign: 'center' }}>Cargando solicitudes...</Box>;
    }

    return (
        <MobileListShell
            items={data?.items ?? []}
            total={data?.total ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            emptyMessage="Aún no tienes solicitudes de actualización."
            keyExtractor={(item) => item.solicitudId}
            renderHeader={(item) => (
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        {item.tipoDocumentoNombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {formatDateTime(item.fechaRegistro)}
                    </Typography>
                </Box>
            )}
            renderBody={(item) => (
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        Motivo: {item.motivoSolicitud || 'Sin motivo'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Estado: {item.estadoRevision}
                    </Typography>
                    {onEdit && canEdit?.(item) || onDelete && canDelete?.(item) ? (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 0.5 }}>
                            {onEdit && canEdit?.(item) ? (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<EditOutlined />}
                                    onClick={() => onEdit(item)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Editar
                                </Button>
                            ) : null}
                            {onDelete && canDelete?.(item) ? (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteOutline />}
                                    onClick={() => onDelete(item)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Eliminar
                                </Button>
                            ) : null}
                        </Box>
                    ) : null}
                </Stack>
            )}
        />
    );
}
