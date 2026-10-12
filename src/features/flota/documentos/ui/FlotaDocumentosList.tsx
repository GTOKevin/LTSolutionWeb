import { useMemo, useRef, useState } from 'react';
import {
    Box,
    Button,
    Collapse,
    IconButton,
    Paper,
    TableCell,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    PostAdd as PostAddIcon,
    ExpandLess,
    ExpandMore,
    Description as DescriptionIcon,
    CloudDownload as CloudDownloadIcon,
    PictureAsPdf as PdfIcon,
    VerifiedUser as VerifiedUserIcon,
    NotificationImportant as NotificationImportantIcon,
    SnippetFolder as SnippetFolderIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { FlotaDocumento } from '@entities/flota/model/types';
import type { PagedResponse } from '@/shared/model/types';
import { FLOTA_QUERY_KEYS } from '../../model/query-keys';
import { mapFlotaDocumentoToFormValues, type CreateFlotaDocumentoSchema } from '../../model/schema';
import { formatDateLong } from '@/shared/utils/date-utils';
import { getDocumentVigenciaMetaByExpirationDate } from '@/shared/utils/document-vigencia';
import { buildInternalFileUrl } from '@/shared/config/env';
import { FlotaDocumentosForm } from './FlotaDocumentosForm';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { SharedTable, type Column } from '@shared/components/ui/SharedTable';
import { MobileListShell } from '@shared/components/ui/MobileListShell';
import { TableActions } from '@shared/components/ui/TableActions';
import { FlotaDocumentoVigenciaBadge } from '@entities/flota/ui/FlotaDocumentoVigenciaBadge';
import { useCreateFlotaDocumento, useUpdateFlotaDocumento, useDeleteFlotaDocumento } from '../../hooks/useFlotaDocumentoCrud';
import { exportFlotaLegajoPdf } from '../utils/flotaLegajoPdfExport';
import { useToast } from '@/shared/components/ui/Toast';

interface FlotaDocumentosListProps {
    flotaId: number;
    viewOnly?: boolean;
}

const columns: Column[] = [
    { id: 'documento', label: 'Documento', minWidth: 220 },
    { id: 'entidad', label: 'Entidad Emisora', minWidth: 150 },
    { id: 'emision', label: 'Fecha Emisión', minWidth: 120 },
    { id: 'vencimiento', label: 'Vencimiento', minWidth: 200 },
    { id: 'adjunto', label: 'Adjunto', align: 'center', minWidth: 110 },
    { id: 'acciones', label: 'Acciones', align: 'right', minWidth: 130 },
];

const isPdfPath = (rutaArchivo?: string) =>
    Boolean(rutaArchivo && /\.pdf$/i.test(rutaArchivo)) || Boolean(rutaArchivo?.toLowerCase().includes('pdf'));

export function FlotaDocumentosList({ flotaId, viewOnly = false }: FlotaDocumentosListProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const formRef = useRef<HTMLDivElement>(null);

    const [editingDoc, setEditingDoc] = useState<CreateFlotaDocumentoSchema | undefined>(undefined);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormExpanded, setIsFormExpanded] = useState(true);

    const [openDelete, setOpenDelete] = useState(false);
    const [documentoToDelete, setDocumentoToDelete] = useState<FlotaDocumento | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Consulta de flota para obtener placa real
    const { data: flota } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.detail(flotaId),
        queryFn: () => flotaApi.getById(flotaId),
        enabled: !!flotaId,
    });

    const { data, isLoading } = useQuery({
        queryKey: FLOTA_QUERY_KEYS.documentos(flotaId, page, rowsPerPage),
        queryFn: () => flotaApi.getDocumentos({ flotaId, page: page + 1, size: rowsPerPage }),
        enabled: !!flotaId,
    });

    const totalItems = data?.total || 0;
    const items = useMemo(() => data?.items || [], [data?.items]);
    const tableData: PagedResponse<FlotaDocumento> | undefined = data;

    const createMutation = useCreateFlotaDocumento();
    const updateMutation = useUpdateFlotaDocumento();
    const deleteMutation = useDeleteFlotaDocumento();

    // Métricas del Legajo
    const metrics = useMemo(() => {
        let vigentes = 0;
        let porVencer = 0;
        let minDaysPorVencer: number | null = null;

        items.forEach((doc) => {
            const meta = getDocumentVigenciaMetaByExpirationDate(doc.fechaVencimiento);
            if (meta.key === 'vigente') {
                vigentes++;
            } else if (meta.key === 'por_vencer') {
                porVencer++;
                if (meta.daysLeft != null) {
                    if (minDaysPorVencer === null || meta.daysLeft < minDaysPorVencer) {
                        minDaysPorVencer = meta.daysLeft;
                    }
                }
            }
        });

        return {
            vigentes,
            porVencer,
            minDaysPorVencer,
        };
    }, [items]);

    const handleFormCancel = () => {
        setEditingDoc(undefined);
        setEditingId(null);
    };

    const handleEdit = (doc: FlotaDocumento) => {
        setEditingId(doc.flotaDocumentoID);
        setEditingDoc(mapFlotaDocumentoToFormValues(doc));
        setIsFormExpanded(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSubmit = (formData: CreateFlotaDocumentoSchema) => {
        if (editingId) {
            updateMutation.mutate(
                { id: editingId, data: formData },
                {
                    onSuccess: () => {
                        handleFormCancel();
                    },
                }
            );
        } else {
            createMutation.mutate(
                { flotaId, data: formData },
                {
                    onSuccess: () => {
                        handleFormCancel();
                    },
                }
            );
        }
    };

    const handleDelete = (doc: FlotaDocumento) => {
        setDocumentoToDelete(doc);
        setOpenDelete(true);
    };

    const handleDeleteConfirm = () => {
        if (documentoToDelete) {
            deleteMutation.mutate(documentoToDelete.flotaDocumentoID, {
                onSuccess: () => {
                    setOpenDelete(false);
                    setDocumentoToDelete(null);
                },
            });
        }
    };

    const handleOpenPreview = (rutaArchivo?: string) => {
        if (!rutaArchivo) return;
        setPreviewUrl(buildInternalFileUrl(rutaArchivo) || null);
    };

    const handleExportPdf = () => {
        if (items.length === 0) {
            showToast({ message: 'No hay documentos en el legajo para exportar', severity: 'warning' });
            return;
        }
        exportFlotaLegajoPdf({
            placa: flota?.placa,
            flotaId,
            documentos: items,
        });
        showToast({ message: 'Exportando legajo digital a PDF...', severity: 'success' });
    };

    const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 3,
            }}
        >
            {/* Título de Sección y Tira de Badges de Métricas Ejecutivas (Stitch S4) */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    alignItems: { xs: 'flex-start', lg: 'center' },
                    justifyContent: 'space-between',
                    gap: 2.5,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'text.primary',
                        }}
                    >
                        Legajo Digital y Pólizas Obligatorias
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            mt: 0.5,
                        }}
                    >
                        Control de vigencia documental para la placa{' '}
                        <strong
                            style={{
                                fontFamily: 'monospace',
                                color: theme.palette.text.primary,
                                fontWeight: 800,
                            }}
                        >
                            {flota?.placa || '—'}
                        </strong>
                        .
                    </Typography>
                </Box>

                {/* 3 Metric Tiles (Tonal shifts, high contrast, no border) */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                        gap: 1.5,
                        width: { xs: '100%', lg: 'auto' },
                        minWidth: { lg: 540 },
                    }}
                >
                    {/* Badge 1: Vigentes */}
                    <Box
                        sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: 3,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'rgba(16, 185, 129, 0.2)',
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shrink: 0,
                            }}
                        >
                            <VerifiedUserIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>
                                {metrics.vigentes}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: '#10b981',
                                    mt: 0.5,
                                    fontSize: '0.75rem',
                                }}
                            >
                                Documentos Vigentes
                            </Typography>
                        </Box>
                    </Box>

                    {/* Badge 2: Por Vencer */}
                    <Box
                        sx={{
                            bgcolor: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: 3,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: 'rgba(245, 158, 11, 0.2)',
                                color: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shrink: 0,
                            }}
                        >
                            <NotificationImportantIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>
                                {metrics.porVencer}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: '#f59e0b',
                                    mt: 0.5,
                                    fontSize: '0.75rem',
                                }}
                            >
                                {metrics.minDaysPorVencer !== null
                                    ? `Por Vencer en ${metrics.minDaysPorVencer} días`
                                    : 'Sin Alertas Próximas'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Badge 3: Total Legajo */}
                    <Box
                        sx={{
                            bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.default, 0.6)
                                    : '#e7eeff',
                            borderRadius: 3,
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.primary.main, 0.25)
                                        : '#d8e3fb',
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shrink: 0,
                            }}
                        >
                            <SnippetFolderIcon sx={{ fontSize: 22 }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>
                                {totalItems}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.secondary',
                                    mt: 0.5,
                                    fontSize: '0.75rem',
                                }}
                            >
                                Documentos en Legajo
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Acordeón Formulario: Registrar / Renovar Documento (Stitch Layout) */}
            {!viewOnly && (
                <Paper
                    ref={formRef}
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                        bgcolor: theme.palette.background.paper,
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    }}
                >
                    {/* Header del Acordeón Clickable */}
                    <Box
                        onClick={() => setIsFormExpanded((prev) => !prev)}
                        sx={{
                            p: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.default, 0.4)
                                    : 'rgba(240, 243, 255, 0.6)',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.background.default, 0.8)
                                        : 'rgba(240, 243, 255, 1)',
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 2,
                                    bgcolor: '#004580',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shrink: 0,
                                }}
                            >
                                <PostAddIcon sx={{ fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {editingId ? 'Editar Documento' : 'Registrar / Renovar Documento'}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        display: 'block',
                                        mt: 0.25,
                                    }}
                                >
                                    Actualice certificados, pólizas de transporte o autorizaciones de circulación
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {editingId ? (
                                <Button
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFormCancel();
                                    }}
                                    startIcon={<CloseIcon fontSize="small" />}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        color: 'warning.main',
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        borderRadius: 2,
                                        px: 1.5,
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.warning.main, 0.2),
                                        },
                                    }}
                                >
                                    Cancelar Edición
                                </Button>
                            ) : (
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        bgcolor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? alpha(theme.palette.primary.main, 0.15)
                                                : '#e7eeff',
                                        color: 'primary.main',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        display: { xs: 'none', sm: 'inline-block' },
                                    }}
                                >
                                    Edición Rápida
                                </Box>
                            )}

                            <IconButton
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                }}
                            >
                                {isFormExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Contenido Colapsable del Formulario */}
                    <Collapse in={isFormExpanded} unmountOnExit>
                        <FlotaDocumentosForm
                            defaultValues={editingDoc}
                            onSubmit={handleSubmit}
                            onCancel={handleFormCancel}
                            isSubmitting={createMutation.isPending || updateMutation.isPending}
                            isEditing={Boolean(editingId)}
                            viewOnly={viewOnly}
                        />
                    </Collapse>
                </Paper>
            )}

            {/* Tabla de Documentos Registrados (Stitch S4) */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                    bgcolor: theme.palette.background.paper,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                }}
            >
                {/* Header de la Tabla */}
                <Box
                    sx={{
                        p: 2.5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? alpha(theme.palette.background.default, 0.3)
                                : 'rgba(240, 243, 255, 0.35)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DescriptionIcon sx={{ color: '#004580', fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Documentos Registrados en Legajo ({totalItems})
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={handleExportPdf}
                        startIcon={<CloudDownloadIcon />}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            height: 40,
                            px: 2,
                            color: 'text.primary',
                            borderColor: alpha(theme.palette.divider, 0.8),
                            bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.default, 0.6)
                                    : '#e7eeff',
                            '&:hover': {
                                bgcolor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.primary.main, 0.2)
                                        : '#d8e3fb',
                                borderColor: 'primary.main',
                            },
                        }}
                    >
                        Exportar Legajo (PDF)
                    </Button>
                </Box>

                {/* Tabla Desktop (SharedTable) */}
                <SharedTable
                    data={tableData}
                    isLoading={isLoading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    columns={columns}
                    keyExtractor={(doc) => doc.flotaDocumentoID}
                    emptyMessage="No hay documentos registrados. Utilice el formulario superior para registrar pólizas y certificados para esta unidad."
                    variant="flat"
                    containerSx={{ border: 'none', borderRadius: 0 }}
                    renderRow={(doc) => (
                        <>
                            {/* Columna 1: Documento */}
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            bgcolor: isPdfPath(doc.rutaArchivo)
                                                ? alpha(theme.palette.error.main, 0.12)
                                                : alpha(theme.palette.primary.main, 0.12),
                                            color: isPdfPath(doc.rutaArchivo) ? 'error.main' : 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shrink: 0,
                                        }}
                                    >
                                        {isPdfPath(doc.rutaArchivo) ? (
                                            <PdfIcon sx={{ fontSize: 22 }} />
                                        ) : (
                                            <DescriptionIcon sx={{ fontSize: 22 }} />
                                        )}
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: 'monospace',
                                                fontWeight: 800,
                                                letterSpacing: '0.04em',
                                                color: 'text.primary',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {doc.numeroDocumento || 'S/N'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: 'text.secondary',
                                                display: 'block',
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {doc.tipoDocumento?.nombre || `Tipo ${doc.tipoDocumentoID}`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>

                            {/* Columna 2: Entidad Emisora */}
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                    {doc.entidadEmisora || '—'}
                                </Typography>
                            </TableCell>

                            {/* Columna 3: Fecha Emisión */}
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontFamily: 'monospace',
                                        color: 'text.primary',
                                    }}
                                >
                                    {formatDateLong(doc.fechaEmision) || '—'}
                                </Typography>
                            </TableCell>

                            {/* Columna 4: Vencimiento & Semáforo */}
                            <TableCell sx={{ py: 2, px: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            color: 'text.primary',
                                        }}
                                    >
                                        {formatDateLong(doc.fechaVencimiento) || '—'}
                                    </Typography>
                                    <FlotaDocumentoVigenciaBadge fechaVencimiento={doc.fechaVencimiento} />
                                </Box>
                            </TableCell>

                            {/* Columna 5: Adjunto */}
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                                {doc.rutaArchivo ? (
                                    <Button
                                        size="small"
                                        onClick={() => handleOpenPreview(doc.rutaArchivo)}
                                        sx={{
                                            bgcolor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.background.default, 0.7)
                                                    : '#dee8ff',
                                            color: 'text.primary',
                                            borderRadius: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            px: 1.25,
                                            py: 0.4,
                                            '&:hover': {
                                                bgcolor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                        ? alpha(theme.palette.primary.main, 0.25)
                                                        : '#d8e3fb',
                                            },
                                        }}
                                    >
                                        Ver Adjunto
                                    </Button>
                                ) : (
                                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                        —
                                    </Typography>
                                )}
                            </TableCell>

                            {/* Columna 6: Acciones */}
                            <TableCell align="right" sx={{ py: 2, px: 3 }}>
                                <TableActions
                                    onView={doc.rutaArchivo ? () => handleOpenPreview(doc.rutaArchivo) : undefined}
                                    viewTooltip="Previsualizar Documento"
                                    onEdit={viewOnly ? undefined : () => handleEdit(doc)}
                                    onDelete={viewOnly ? undefined : () => handleDelete(doc)}
                                />
                            </TableCell>
                        </>
                    )}
                />

                {/* Listado Mobile (MobileListShell) */}
                <MobileListShell<FlotaDocumento>
                    items={items}
                    total={totalItems}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    viewOnly={viewOnly}
                    emptyMessage="No hay documentos registrados en el legajo."
                    keyExtractor={(doc) => doc.flotaDocumentoID}
                    onPreview={doc => handleOpenPreview(doc.rutaArchivo)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canEdit={() => !viewOnly}
                    canDelete={() => !viewOnly}
                    renderHeader={(doc) => (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={800} fontFamily="monospace">
                                {doc.numeroDocumento || 'S/N'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {doc.tipoDocumento?.nombre || `Tipo ${doc.tipoDocumentoID}`}
                            </Typography>
                        </Box>
                    )}
                    renderBody={(doc) => (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <FlotaDocumentoVigenciaBadge fechaVencimiento={doc.fechaVencimiento} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Entidad</Typography>
                                <Typography variant="caption" fontWeight={600}>{doc.entidadEmisora || '—'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Vence</Typography>
                                <Typography variant="caption" fontWeight={600}>{formatDateLong(doc.fechaVencimiento) || '—'}</Typography>
                            </Box>
                        </Box>
                    )}
                />
            </Paper>

            {/* Diálogo de Confirmación para Eliminar */}
            <ConfirmDialog
                open={openDelete}
                title="Eliminar Documento"
                content={`¿Está seguro que desea eliminar el documento ${documentoToDelete?.numeroDocumento || ''}? Esta acción no se puede deshacer.`}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
            />

            {/* Modal de Previsualización de Documento */}
            <DocumentPreviewDialog
                open={Boolean(previewUrl)}
                onClose={() => setPreviewUrl(null)}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
