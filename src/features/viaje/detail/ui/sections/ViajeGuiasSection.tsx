import { DescriptionOutlined as DescriptionOutlinedIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import { buildInternalFileUrl } from '@shared/config/env';
import type { ViajeDetail, ViajeGuiaDetail } from '@/entities/viaje/model/types';
import { DocumentAttachmentCard } from '../shared/DocumentAttachmentCard';

interface ViajeGuiasSectionProps {
    viaje: ViajeDetail;
}

export function ViajeGuiasSection({ viaje }: ViajeGuiasSectionProps) {
    const theme = useTheme();
    const guias = viaje.guias ?? [];

    const handleDownloadImage = (item: ViajeGuiaDetail) => {
        const archivoUrl = item.rutaArchivo ? buildInternalFileUrl(item.rutaArchivo) : null;
        if (!archivoUrl) return;
        window.open(archivoUrl, '_blank', 'noopener,noreferrer');
    };

    return (
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

                                <DocumentAttachmentCard
                                    title={`Guía ${item.serie} - ${item.numero}`}
                                    fileUrl={archivoUrl}
                                    onDownload={() => handleDownloadImage(item)}
                                />
                            </Stack>
                        </Paper>
                    );
                })
            )}
        </Stack>
    );
}
