import { useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    FactCheck as FactCheckIcon,
    HealthAndSafety as HealthAndSafetyIcon,
    ChecklistRtl as ChecklistRtlIcon,
    Badge as BadgeIcon,
    Warning as WarningIcon,
    Description as DescriptionIcon,
    Verified as VerifiedIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    Autorenew as AutorenewIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { flotaApi } from '@entities/flota/api/flota.api';
import type { FlotaDocumento } from '@entities/flota/model/types';
import { FLOTA_QUERY_KEYS } from '@features/flota/model/query-keys';
import { useCreateFlotaDocumento, useUpdateFlotaDocumento } from '../../../hooks/useFlotaDocumentoCrud';
import { FlotaDocumentosForm } from '../../../documentos/ui/FlotaDocumentosForm';
import { mapFlotaDocumentoToFormValues, type CreateFlotaDocumentoSchema } from '../../../model/schema';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@/shared/config/env';
import { formatDateShort } from '@/shared/utils/date-utils';
import { getDocumentVigenciaMetaByExpirationDate } from '@/shared/utils/document-vigencia';

interface FlotaExpedienteDocumentosTabProps {
    flotaId: number;
    canManage?: boolean;
    initialDocumentos?: FlotaDocumento[];
}

function getDocumentVisuals(nombre?: string) {
    const text = (nombre ?? '').toLowerCase();
    if (text.includes('soat')) {
        return {
            icon: <HealthAndSafetyIcon sx={{ fontSize: 22 }} />,
            color: '#10b981',
            defaultVerification: 'Firma digital SUTRAN verificada',
        };
    }
    if (text.includes('revis') || text.includes('citv') || text.includes('tecnic')) {
        return {
            icon: <ChecklistRtlIcon sx={{ fontSize: 22 }} />,
            color: '#10b981',
            defaultVerification: 'Frenos y emisiones aprobados',
        };
    }
    if (text.includes('tarjeta') || text.includes('propiedad') || text.includes('identificaci') || text.includes('sunarp')) {
        return {
            icon: <BadgeIcon sx={{ fontSize: 22 }} />,
            color: '#0284c7',
            defaultVerification: 'Inscripción registral definitiva',
        };
    }
    if (text.includes('poliza') || text.includes('seguro') || text.includes('rc') || text.includes('carga')) {
        return {
            icon: <WarningIcon sx={{ fontSize: 22 }} />,
            color: '#f59e0b',
            defaultVerification: 'Póliza y endoso registrados',
        };
    }
    return {
        icon: <DescriptionIcon sx={{ fontSize: 22 }} />,
        color: '#2563eb',
        defaultVerification: 'Documento técnico auditado',
    };
}

export function FlotaExpedienteDocumentosTab({
    flotaId,
    canManage = false,
    initialDocumentos,
}: FlotaExpedienteDocumentosTabProps) {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [documentoToRenew, setDocumentoToRenew] = useState<FlotaDocumento | null>(null);

    const { data: documentosResponse, isLoading } = useQuery({
        queryKey: ['flota-documentos', flotaId],
        queryFn: () => flotaApi.getDocumentos({ flotaId, size: 50 }),
        enabled: flotaId > 0,
    });

    const createMutation = useCreateFlotaDocumento();
    const updateMutation = useUpdateFlotaDocumento();

    const items: FlotaDocumento[] = documentosResponse?.items ?? initialDocumentos ?? [];

    const handleOpenCreate = () => {
        setDocumentoToRenew(null);
        setOpenModal(true);
    };

    const handleOpenRenovar = (doc: FlotaDocumento) => {
        setDocumentoToRenew(doc);
        setOpenModal(true);
    };

    const handleFormSubmit = (formData: CreateFlotaDocumentoSchema) => {
        if (documentoToRenew) {
            updateMutation.mutate(
                { id: documentoToRenew.flotaDocumentoID, data: formData },
                {
                    onSuccess: () => {
                        setOpenModal(false);
                        setDocumentoToRenew(null);
                        queryClient.invalidateQueries({ queryKey: ['flota-documentos', flotaId] });
                        queryClient.invalidateQueries({ queryKey: FLOTA_QUERY_KEYS.expediente(flotaId) });
                    },
                }
            );
        } else {
            createMutation.mutate(
                { flotaId, data: formData },
                {
                    onSuccess: () => {
                        setOpenModal(false);
                        setDocumentoToRenew(null);
                        queryClient.invalidateQueries({ queryKey: ['flota-documentos', flotaId] });
                        queryClient.invalidateQueries({ queryKey: FLOTA_QUERY_KEYS.expediente(flotaId) });
                    },
                }
            );
        }
    };

    const handleOpenPreview = (rutaArchivo?: string) => {
        if (!rutaArchivo) return;
        setPreviewUrl(buildInternalFileUrl(rutaArchivo) || null);
    };

    const vigentesCount = items.filter((doc) => {
        const meta = getDocumentVigenciaMetaByExpirationDate(doc.fechaVencimiento);
        return meta.key === 'vigente';
    }).length;

    return (
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header Barra Contextual Stitch S3 */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.success.main, 0.12),
                            color: theme.palette.success.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shrink: 0,
                        }}
                    >
                        <FactCheckIcon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            Legajo Técnico & Pólizas Obligatorias
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Auditado y validado en tiempo real con Plataforma Digital SUTRAN
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
                    <Chip
                        label={`${vigentesCount} / ${items.length} Documentos Vigentes SUTRAN/MTC`}
                        size="small"
                        sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.12),
                            color: theme.palette.success.main,
                            fontWeight: 700,
                            borderRadius: 2,
                            height: 28,
                        }}
                    />
                    {canManage ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleOpenCreate}
                            sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': { boxShadow: theme.shadows[2] },
                            }}
                        >
                            + Subir Nuevo Documento
                        </Button>
                    ) : null}
                </Box>
            </Paper>

            {/* Grid de Tarjetas Stitch S3 */}
            {items.length === 0 && !isLoading ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: `1px dashed ${theme.palette.divider}`,
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                    }}
                >
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                        Sin documentos técnicos registrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mt: 0.5, mb: 2 }}>
                        La unidad aún no cuenta con pólizas o documentos en su legajo.
                    </Typography>
                    {canManage ? (
                        <Button
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            onClick={handleOpenCreate}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            + Subir Primer Documento
                        </Button>
                    ) : null}
                </Paper>
            ) : (
                <Grid container spacing={2.5}>
                    {items.map((doc) => {
                        const docNombre = doc.tipoDocumento?.nombre || 'Documento Técnico';
                        const visuals = getDocumentVisuals(docNombre);
                        const vigenciaMeta = getDocumentVigenciaMetaByExpirationDate(doc.fechaVencimiento);

                        let badgeLabel = 'Vigente';
                        let badgeBg = alpha(theme.palette.success.main, 0.12);
                        let badgeColor = theme.palette.success.main;

                        if (!doc.fechaVencimiento) {
                            badgeLabel = 'Permanente';
                            badgeBg = alpha(theme.palette.primary.main, 0.12);
                            badgeColor = theme.palette.primary.main;
                        } else if (vigenciaMeta.key === 'vencido') {
                            const days = vigenciaMeta.daysLeft != null ? Math.abs(vigenciaMeta.daysLeft) : 0;
                            badgeLabel = days > 0 ? `Vencido hace ${days}d` : 'Vencido';
                            badgeBg = alpha(theme.palette.error.main, 0.12);
                            badgeColor = theme.palette.error.main;
                        } else if (vigenciaMeta.key === 'por_vencer') {
                            const days = vigenciaMeta.daysLeft ?? 0;
                            badgeLabel = `Vence en ${days} días`;
                            badgeBg = alpha(theme.palette.warning.main, 0.15);
                            badgeColor = theme.palette.warning.dark;
                        } else {
                            const days = vigenciaMeta.daysLeft ?? 0;
                            if (days > 365) {
                                badgeLabel = `Vigente • ${(days / 365).toFixed(1)} años`;
                            } else {
                                badgeLabel = `Vigente • ${days} días`;
                            }
                        }

                        const hasFile = Boolean(doc.rutaArchivo);

                        return (
                            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={doc.flotaDocumentoID}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 3,
                                        border: `1px solid ${theme.palette.divider}`,
                                        bgcolor: theme.palette.background.paper,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: '100%',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            boxShadow: theme.shadows[3],
                                            borderColor: alpha(visuals.color, 0.4),
                                        },
                                    }}
                                >
                                    <Box>
                                        {/* Fila Superior: Ícono + Chip Estado */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(visuals.color, 0.12),
                                                    color: visuals.color,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {visuals.icon}
                                            </Box>
                                            <Chip
                                                label={badgeLabel}
                                                size="small"
                                                sx={{
                                                    bgcolor: badgeBg,
                                                    color: badgeColor,
                                                    fontWeight: 700,
                                                    fontSize: '0.72rem',
                                                    height: 22,
                                                    borderRadius: 999,
                                                }}
                                            />
                                        </Box>

                                        {/* Título y Entidad Emisora */}
                                        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.25, mb: 0.5 }}>
                                            {docNombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                            {doc.entidadEmisora || 'Entidad Oficial / Reguladora'}
                                        </Typography>

                                        {/* Cajetín con Metadatos */}
                                        <Box
                                            sx={{
                                                bgcolor: theme.palette.mode === 'dark' ? alpha('#1e293b', 0.6) : '#f8fafc',
                                                p: 1.25,
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.5,
                                                fontSize: '0.75rem',
                                                fontFamily: 'monospace',
                                                mb: 1.5,
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Nº Doc:
                                                </Typography>
                                                <Typography variant="caption" fontWeight={700} color="text.primary">
                                                    {doc.numeroDocumento || '—'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {doc.fechaVencimiento ? 'Vence:' : 'Emisión:'}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    fontWeight={700}
                                                    color={vigenciaMeta.key === 'vencido' ? 'error.main' : 'text.primary'}
                                                >
                                                    {doc.fechaVencimiento
                                                        ? formatDateShort(doc.fechaVencimiento)
                                                        : formatDateShort(doc.fechaEmision)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Verificación SUTRAN */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
                                            {vigenciaMeta.key === 'vencido' ? (
                                                <WarningIcon sx={{ fontSize: 15, color: theme.palette.error.main }} />
                                            ) : (
                                                <VerifiedIcon sx={{ fontSize: 15, color: theme.palette.success.main }} />
                                            )}
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontSize: '0.72rem',
                                                    color: vigenciaMeta.key === 'vencido' ? 'error.main' : 'text.secondary',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {vigenciaMeta.key === 'vencido'
                                                    ? 'Requiere renovación urgente'
                                                    : visuals.defaultVerification}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Botones de Acción: Ver Documento y Renovar */}
                                    {(() => {
                                        const needsRenewal = vigenciaMeta.key === 'vencido' || vigenciaMeta.key === 'por_vencer';
                                        const showRenovar = canManage && needsRenewal;

                                        return (
                                            <Box
                                                sx={{
                                                    pt: 1.5,
                                                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                                                    display: 'flex',
                                                    gap: 1,
                                                }}
                                            >
                                                <Button
                                                    fullWidth
                                                    size="small"
                                                    variant={hasFile ? 'outlined' : 'text'}
                                                    disabled={!hasFile}
                                                    startIcon={hasFile ? <VisibilityIcon /> : <DescriptionIcon />}
                                                    onClick={() => handleOpenPreview(doc.rutaArchivo)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        py: 0.75,
                                                        fontSize: '0.78rem',
                                                    }}
                                                >
                                                    {hasFile ? 'Ver Documento' : 'Sin Archivo'}
                                                </Button>

                                                {showRenovar ? (
                                                    <Button
                                                        fullWidth
                                                        size="small"
                                                        variant="contained"
                                                        color={vigenciaMeta.key === 'vencido' ? 'error' : 'warning'}
                                                        startIcon={<AutorenewIcon />}
                                                        onClick={() => handleOpenRenovar(doc)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            borderRadius: 2,
                                                            py: 0.75,
                                                            fontSize: '0.78rem',
                                                            boxShadow: 'none',
                                                            '&:hover': {
                                                                boxShadow: theme.shadows[2],
                                                            },
                                                        }}
                                                    >
                                                        Renovar
                                                    </Button>
                                                ) : null}
                                            </Box>
                                        );
                                    })()}
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Modal para Subir o Renovar Documento */}
            <Dialog
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setDocumentoToRenew(null);
                }}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 },
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {documentoToRenew ? (
                            <AutorenewIcon color="warning" />
                        ) : (
                            <CloudUploadIcon color="primary" />
                        )}
                        <Typography variant="h6" fontWeight={700}>
                            {documentoToRenew
                                ? `Renovar Documento: ${documentoToRenew.tipoDocumento?.nombre || documentoToRenew.numeroDocumento}`
                                : 'Subir Documento Técnico al Legajo'}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setOpenModal(false);
                            setDocumentoToRenew(null);
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <FlotaDocumentosForm
                        key={documentoToRenew ? `renew-${documentoToRenew.flotaDocumentoID}` : 'new'}
                        defaultValues={documentoToRenew ? mapFlotaDocumentoToFormValues(documentoToRenew) : undefined}
                        isEditing={Boolean(documentoToRenew)}
                        onSubmit={handleFormSubmit}
                        onCancel={() => {
                            setOpenModal(false);
                            setDocumentoToRenew(null);
                        }}
                        isSubmitting={createMutation.isPending || updateMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal Visor de Documentos */}
            <DocumentPreviewDialog
                open={Boolean(previewUrl)}
                onClose={() => setPreviewUrl(null)}
                previewUrl={previewUrl}
            />
        </Box>
    );
}
