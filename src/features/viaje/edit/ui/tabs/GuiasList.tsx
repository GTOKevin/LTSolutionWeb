import { useState } from 'react';
import {
    Box, Typography, Button, useTheme, alpha, CircularProgress, IconButton,
} from '@mui/material';
import {
    Description as DescriptionIcon,
    LocalShipping as LocalShippingIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    ImageNotSupported as ImageNotSupportedIcon,
} from '@mui/icons-material';
import { useViajeGuias, useDeleteViajeGuia } from '@features/viaje/hooks/useViajeGuias';
import { useViajeGuiaOptions } from '@features/viaje/options/hooks/useViajeScopedOptions';
import { buildInternalFileUrl } from '@/shared/config/env';
import { DocumentPreviewDialog } from '@/shared/components/ui/DocumentPreviewDialog';
import { downloadFileFromUrl } from '@/shared/utils/file-utils';
import { logger } from '@/shared/utils/logger';

interface GuiasListProps {
    viajeID: number;
    isViewOnly?: boolean;
}

export function GuiasList({ viajeID, isViewOnly }: GuiasListProps) {
    const theme = useTheme();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data: guiasData, isLoading: isLoadingGuias } = useViajeGuias(viajeID, 1, 100);
    const deleteMutation = useDeleteViajeGuia();
    const { tiposGuia } = useViajeGuiaOptions(true);

    const guias = guiasData?.items ?? [];

    const handleDelete = async (id: number) => {
        try {
            await deleteMutation.mutateAsync({ id, viajeId: viajeID });
        } catch (error) {
            logger.error('Error al eliminar guía', error);
        }
    };

    const handlePreview = (path: string) => {
        setPreviewUrl(buildInternalFileUrl(path) || null);
    };

    const handleDownload = (path: string) => {
        const url = buildInternalFileUrl(path);
        if (url) {
            void downloadFileFromUrl(url);
        }
    };

    const getGuideTypeIcon = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return <DescriptionIcon />;
        if (text.toLowerCase().includes('transportista')) return <LocalShippingIcon />;
        return <DescriptionIcon />;
    };

    const getGuideTypeBg = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return alpha(theme.palette.primary.main, 0.1);
        if (text.toLowerCase().includes('transportista')) return alpha(theme.palette.success.main, 0.1);
        return alpha(theme.palette.text.secondary, 0.1);
    };

    const getGuideTypeColor = (text: string) => {
        if (text.toLowerCase().includes('remitente')) return theme.palette.primary.main;
        if (text.toLowerCase().includes('transportista')) return theme.palette.success.main;
        return theme.palette.text.secondary;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1.5 }}>
                    Documentos Cargados ({guias.length})
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {isLoadingGuias && <CircularProgress size={24} sx={{ m: 'auto', gridColumn: '1 / -1' }} />}

                {!isLoadingGuias && guias.map((guia) => {
                    const tipoText = tiposGuia?.find((tipo) => tipo.id === guia.tipoGuiaID)?.text || 'Desconocido';
                    const hasFile = !!guia.rutaArchivo;

                    return (
                        <Box
                            key={guia.viajeGuiaID}
                            sx={{
                                bgcolor: 'background.paper',
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.5),
                                boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: getGuideTypeBg(tipoText),
                                            color: getGuideTypeColor(tipoText),
                                        }}
                                    >
                                        {getGuideTypeIcon(tipoText)}
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={800} color="text.primary">
                                            {guia.serie}-{guia.numero}
                                        </Typography>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                            {tipoText}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                                    <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.6rem' }}>
                                        REGISTRADO
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    aspectRatio: '16/9',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'grey.100',
                                    '&:hover .actions-overlay': { opacity: 1 },
                                    '&:hover .preview-img': { filter: 'grayscale(0)' },
                                }}
                            >
                                {hasFile ? (
                                    <>
                                        <img
                                            className="preview-img"
                                            src={buildInternalFileUrl(guia.rutaArchivo!)}
                                            alt="Documento"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'all 0.3s' }}
                                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                                        />
                                        <Box
                                            className="actions-overlay"
                                            sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                bgcolor: 'rgba(0,0,0,0.4)',
                                                opacity: 0,
                                                transition: 'opacity 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 1.5,
                                            }}
                                        >
                                            <IconButton onClick={() => handlePreview(guia.rutaArchivo!)} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' }, boxShadow: 2, width: 32, height: 32 }}>
                                                <VisibilityIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDownload(guia.rutaArchivo!)} sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'white' }, boxShadow: 2, width: 32, height: 32 }}>
                                                <DownloadIcon sx={{ fontSize: 18, color: 'text.primary' }} />
                                            </IconButton>
                                        </Box>
                                    </>
                                ) : (
                                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                                        <ImageNotSupportedIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 0.5 }} />
                                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                                            Sin Previsualización
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={500} />
                                {!isViewOnly && (
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(guia.viajeGuiaID)}
                                        disabled={deleteMutation.isPending}
                                        sx={{ fontWeight: 800, fontSize: '0.7rem', p: 0, minWidth: 'auto' }}
                                        startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />}
                                    >
                                        Borrar
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    );
                })}

                {!isViewOnly && (
                    <Box
                        sx={{
                            border: '1px dashed',
                            borderColor: alpha(theme.palette.divider, 0.7),
                            borderRadius: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                        }}
                    >
                        <Typography variant="body2" fontWeight={800} color="text.primary">
                            Registra una nueva guía desde el formulario lateral
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, maxWidth: 260 }}>
                            Usa el formulario de esta sección para adjuntar otro documento al viaje actual.
                        </Typography>
                    </Box>
                )}
            </Box>

            <DocumentPreviewDialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} previewUrl={previewUrl} />
        </Box>
    );
}
