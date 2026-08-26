import { useState } from 'react';
import {
    Box,
    Typography,
    Chip,
    Paper,
    Button,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Link as LinkIcon,
    Description as FileIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { buildInternalFileUrl } from '@/shared/config/env';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { FileThumbnail } from '@/shared/components/ui/FileThumbnail';
import type { FacturaGuia } from '@/entities/factura/model/types';

interface FacturaAssociatedGuidesProps {
    guias: FacturaGuia[];
}

export function FacturaAssociatedGuides({ guias }: FacturaAssociatedGuidesProps) {
    const theme = useTheme();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleOpenPreview = (rutaArchivo: string) => {
        const fullUrl = buildInternalFileUrl(rutaArchivo);
        if (fullUrl) {
            setPreviewUrl(fullUrl);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                bgcolor: 'background.paper',
                boxShadow: '0 12px 32px -8px rgba(25, 28, 29, 0.05)',
                overflow: 'hidden',
            }}
        >
            {/* Header de la sección */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LinkIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        Guías de Remisión Asociadas
                    </Typography>
                </Box>
                <Chip
                    label={`${guias.length} ${guias.length === 1 ? 'Guía' : 'Guías'}`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                />
            </Box>

            {guias.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <FileIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                        No hay guías de remisión registradas en los viajes de esta factura.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {guias.map((guia) => {
                        const fileUrl = guia.rutaArchivo ? buildInternalFileUrl(guia.rutaArchivo) : null;

                        return (
                            <Paper
                                key={guia.viajeGuiaID}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    borderColor: alpha(theme.palette.divider, 0.8),
                                    bgcolor: alpha(theme.palette.background.default, 0.3),
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    gap: 1.5,
                                    transition: 'border-color 0.2s, background-color 0.2s',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {fileUrl ? (
                                        <FileThumbnail fileUrl={fileUrl} alt={`Guía ${guia.serie} - ${guia.numero}`} showFileLabel />
                                    ) : (
                                        <FileIcon fontSize="small" />
                                    )}
                                    </Box>

                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={800}
                                                fontFamily="monospace"
                                                sx={{
                                                    color: 'text.primary',
                                                    borderBottom: '1px dotted',
                                                    borderColor: 'text.secondary',
                                                }}
                                            >
                                                {guia.serie} - {guia.numero}
                                            </Typography>
                                            <Chip
                                                label={guia.tipoGuiaDescripcion || 'Guía de Remisión'}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.68rem',
                                                    height: 20,
                                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {guia.codigoViaje ? `Viaje: ${guia.codigoViaje}` : 'Sin viaje asignado'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, display: 'flex', justifyContent: 'flex-end' }}>
                                    {fileUrl ? (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<OpenInNewIcon fontSize="small" />}
                                            onClick={() => handleOpenPreview(guia.rutaArchivo!)}
                                            sx={{
                                                borderRadius: 1.5,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                            }}
                                        >
                                            Ver Archivo
                                        </Button>
                                    ) : (
                                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                            Sin archivo adjunto
                                        </Typography>
                                    )}
                                </Box>
                            </Paper>
                        );
                    })}
                </Box>
            )}

            <DocumentPreviewDialog
                open={!!previewUrl}
                onClose={() => setPreviewUrl(null)}
                previewUrl={previewUrl}
            />
        </Paper>
    );
}
