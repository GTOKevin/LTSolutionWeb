import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Download as DownloadIcon, ZoomIn as ZoomInIcon } from '@mui/icons-material';
import { DocumentPreviewDialog } from '@shared/components/ui/DocumentPreviewDialog';

interface DocumentAttachmentCardProps {
    title: string;
    fileUrl: string | null;
    onDownload?: () => void;
}

/**
 * Tarjeta de documento adjunto: thumbnail con overlay de zoom, acciones de
 * vista previa y descarga, y el dialogo de preview. Centraliza el patrón
 * repetido en las secciones de guías y permisos del detalle de viaje.
 */
export function DocumentAttachmentCard({ title, fileUrl, onDownload }: DocumentAttachmentCardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);

    if (!fileUrl) {
        return (
            <Typography variant="caption" color="text.disabled">
                Sin imagen adjunta
            </Typography>
        );
    }

    return (
        <>
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box
                    onClick={() => setPreviewOpen(true)}
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
                        src={fileUrl}
                        alt={title}
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
                        onClick={() => setPreviewOpen(true)}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Vista previa
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={onDownload}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Descargar
                    </Button>
                </Stack>
            </Stack>

            <DocumentPreviewDialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                previewUrl={fileUrl}
                previewUrls={[fileUrl]}
                initialIndex={0}
                title={title}
            />
        </>
    );
}
