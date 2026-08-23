import {
    DescriptionOutlined as DescriptionOutlinedIcon,
    Download as DownloadIcon,
    ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { Box, Button, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { useState } from 'react';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';
import { buildInternalFileUrl } from '@shared/config/env';
import type { ViajeDetail, ViajeGuiaDetail } from '@/entities/viaje/model/types';

interface ViajeGuiasSectionProps {
    viaje: ViajeDetail;
}

interface GuiaPreviewState {
    previewUrl: string | null;
    previewUrls: string[];
    currentIndex: number;
    title: string;
}

const CLOSED_GUIA_PREVIEW: GuiaPreviewState = {
    previewUrl: null,
    previewUrls: [],
    currentIndex: 0,
    title: '',
};

export function ViajeGuiasSection({ viaje }: ViajeGuiasSectionProps) {
    const theme = useTheme();
    const [preview, setPreview] = useState<GuiaPreviewState>(CLOSED_GUIA_PREVIEW);
    const guias = viaje.guias ?? [];

    const handleClosePreview = () => {
        setPreview(CLOSED_GUIA_PREVIEW);
    };

    const handleDownloadImage = (item: ViajeGuiaDetail) => {
        const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
        if (!archivoUrl) return;
        window.open(archivoUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <Stack spacing={2}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <DescriptionOutlinedIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle1" fontWeight={800}>
                            Guías del Viaje
                        </Typography>
                        <Chip
                            label={`${guias.length} ${guias.length === 1 ? 'guía' : 'guías'}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                        Guías de remisión utilizadas en este viaje.
                    </Typography>
                </Box>

                {guias.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <DescriptionOutlinedIcon color="disabled" sx={{ fontSize: 36, mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No hay guías registradas para este viaje.
                        </Typography>
                    </Paper>
                ) : (
                    guias.map((item) => {
                        const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
                        const tipo = item.tipoGuiaDescripcion || 'Guía';

                        return (
                            <Paper
                                key={item.viajeGuiaID}
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
                                            <Chip label={tipo} size="small" color="info" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                                        </Stack>
                                        <Typography variant="subtitle2" fontWeight={800}>
                                            {item.serie} - {item.numero}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Guía de remisión adjunta al viaje
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
                                                        title: `Guía ${item.serie} - ${item.numero}`,
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
                                                    alt={`Guía ${item.serie} - ${item.numero}`}
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
                                                            title: `Guía ${item.serie} - ${item.numero}`,
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