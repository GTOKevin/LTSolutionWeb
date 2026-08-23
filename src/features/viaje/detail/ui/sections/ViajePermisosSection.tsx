import {
    AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
    Download as DownloadIcon,
    ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { Box, Button, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { useState } from 'react';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@shared/config/env';
import { formatDateShort } from '@/shared/utils/date-utils';
import type { ViajeDetail, ViajePermisoDetail } from '@/entities/viaje/model/types';
import { resolveEmployeeViajePermisoStatus } from '@features/employee/viajes/detail/model/view-helpers';

interface ViajePermisosSectionProps {
    viaje: ViajeDetail;
}

interface PermisoPreviewState {
    previewUrl: string | null;
    previewUrls: string[];
    currentIndex: number;
    title: string;
}

const CLOSED_PERMISO_PREVIEW: PermisoPreviewState = {
    previewUrl: null,
    previewUrls: [],
    currentIndex: 0,
    title: '',
};

const STATUS_TONE: Record<string, 'success' | 'warning' | 'error'> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
};

export function ViajePermisosSection({ viaje }: ViajePermisosSectionProps) {
    const theme = useTheme();
    const [preview, setPreview] = useState<PermisoPreviewState>(CLOSED_PERMISO_PREVIEW);
    const permisos = viaje.permisos ?? [];

    const handleClosePreview = () => {
        setPreview(CLOSED_PERMISO_PREVIEW);
    };

    const handleDownloadImage = (item: ViajePermisoDetail) => {
        const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
        if (!archivoUrl) return;
        window.open(archivoUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <Stack spacing={2}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <AssignmentTurnedInOutlinedIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" fontWeight={800}>
                            Permisos del Viaje
                        </Typography>
                        <Chip
                            label={`${permisos.length} ${permisos.length === 1 ? 'permiso' : 'permisos'}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Permisos generados para este viaje con su documento adjunto.
                    </Typography>
                </Box>

                {permisos.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <AssignmentTurnedInOutlinedIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No hay permisos registrados para este viaje.
                        </Typography>
                    </Paper>
                ) : (
                    permisos.map((item) => {
                        const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                        const status = resolveEmployeeViajePermisoStatus(item.fechaVencimiento);

                        return (
                            <Paper
                                key={item.viajePermisoID}
                                variant="outlined"
                                sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                }}
                            >
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                    <Box>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                                            <Chip
                                                label={status.label}
                                                size="small"
                                                color={STATUS_TONE[status.color] ?? 'default'}
                                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                            />
                                        </Stack>
                                        <Typography variant="subtitle2" fontWeight={800}>
                                            Permiso #{item.viajePermisoID}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Vigencia: {formatDateShort(item.fechaVigencia)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Vencimiento: {item.fechaVencimiento ? formatDateShort(item.fechaVencimiento) : 'Sin vencimiento'}
                                        </Typography>
                                    </Box>

                                    {archivoUrl ? (
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            <Box
                                                onClick={() =>
                                                    setPreview({
                                                        previewUrl: archivoUrl,
                                                        previewUrls: [archivoUrl],
                                                        currentIndex: 0,
                                                        title: `Permiso ${item.viajePermisoID}`,
                                                    })
                                                }
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    bgcolor: 'action.hover',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    cursor: 'zoom-in',
                                                    position: 'relative',
                                                    '&:hover .viaje-preview-overlay': { opacity: 1 },
                                                }}
                                            >
                                                <img
                                                    src={archivoUrl}
                                                    alt={`Permiso ${item.viajePermisoID}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                                <Box
                                                    className="viaje-preview-overlay"
                                                    sx={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        bgcolor: 'rgba(0,0,0,0.28)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        opacity: 0,
                                                        transition: 'opacity 0.2s ease',
                                                    }}
                                                >
                                                    <ZoomInIcon sx={{ color: 'common.white', fontSize: 20 }} />
                                                </Box>
                                            </Box>
                                            <Stack direction="column" spacing={0.5}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<ZoomInIcon />}
                                                    onClick={() =>
                                                        setPreview({
                                                            previewUrl: archivoUrl,
                                                            previewUrls: [archivoUrl],
                                                            currentIndex: 0,
                                                            title: `Permiso ${item.viajePermisoID}`,
                                                        })
                                                    }
                                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    Vista previa
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownloadImage(item)}
                                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    Descargar
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    ) : (
                                        <Typography variant="caption" color="text.disabled">
                                            Sin imagen adjunta
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
                        );
                    })
                )}
            </Stack>

            <DocumentPreviewDialog
                open={!!preview.previewUrl}
                onClose={handleClosePreview}
                previewUrl={preview.previewUrl}
                previewUrls={preview.previewUrls}
                initialIndex={preview.currentIndex}
                title={preview.title}
            />
        </>
    );
}