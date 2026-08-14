import {
    Alert,
    Box,
    Dialog,
    DialogContent,
    Typography,
    Button,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import {
    Download as DownloadIcon,
    Close as CloseIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from './Toast';
import { getErrorMessage } from '@/shared/utils/api-errors';

interface DocumentPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    previewUrl: string | null;
    previewUrls?: string[];
    initialIndex?: number;
    title?: string;
    onError?: (message: string) => void;
}

export function DocumentPreviewDialog({
    open,
    onClose,
    previewUrl,
    previewUrls,
    initialIndex = 0,
    title = 'Vista Previa',
    onError,
}: DocumentPreviewDialogProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const normalizedPreviewUrls = useMemo(() => {
        const candidates = (previewUrls && previewUrls.length > 0 ? previewUrls : previewUrl ? [previewUrl] : [])
            .filter((item): item is string => Boolean(item))
            .filter((item, index, array) => array.indexOf(item) === index);

        return candidates;
    }, [previewUrl, previewUrls]);
    const [activeIndex, setActiveIndex] = useState(0);
    const activePreviewUrl = normalizedPreviewUrls[activeIndex] ?? null;
    const hasMultipleImages = normalizedPreviewUrls.length > 1;

    useEffect(() => {
        if (!open) {
            return;
        }

        setErrorMessage(null);
        setImageLoadFailed(false);
        setActiveIndex(
            normalizedPreviewUrls.length === 0
                ? 0
                : Math.min(Math.max(initialIndex, 0), normalizedPreviewUrls.length - 1),
        );
    }, [initialIndex, normalizedPreviewUrls, open]);

    useEffect(() => {
        setErrorMessage(null);
        setImageLoadFailed(false);
    }, [activePreviewUrl]);

    const handleDownload = async () => {
        if (!activePreviewUrl) return;
        try {
            setErrorMessage(null);
            const downloadUrl = new URL(activePreviewUrl, window.location.origin);
            downloadUrl.searchParams.set('t', Date.now().toString());

            const response = await fetch(downloadUrl.toString(), {
                cache: 'no-store'
            });
            if (!response.ok) {
                throw new Error(`Download failed with status ${response.status}`);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = activePreviewUrl.split('/').pop()?.split('?')[0] || 'documento';
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            const message = getErrorMessage(error, 'No se pudo descargar el documento.');
            setErrorMessage(message);
            onError?.(message);
            showToast({ message, severity: 'error' });

            const fallbackWindow = window.open(activePreviewUrl, '_blank', 'noopener,noreferrer');
            if (!fallbackWindow) {
                const popupMessage = 'No se pudo abrir el documento en una nueva pestaña.';
                setErrorMessage(popupMessage);
                onError?.(popupMessage);
                showToast({ message: popupMessage, severity: 'warning' });
            }
        }
    };

    const handlePrevious = () => {
        if (!hasMultipleImages) {
            return;
        }

        setActiveIndex((current) => (current === 0 ? normalizedPreviewUrls.length - 1 : current - 1));
    };

    const handleNext = () => {
        if (!hasMultipleImages) {
            return;
        }

        setActiveIndex((current) => (current === normalizedPreviewUrls.length - 1 ? 0 : current + 1));
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none'
                }
            }}
        >
            <Box
                sx={{
                    px: { xs: 1.5, md: 2 },
                    py: 0.875,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    bgcolor: alpha(theme.palette.background.default, 0.48),
                    backdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    flexWrap: 'wrap',
                    opacity: 0.6,
                    transition: theme.transitions.create(['background-color', 'border-color', 'opacity'], {
                        duration: theme.transitions.duration.shorter,
                    }),
                    '&:hover': {
                        opacity: 1,
                        bgcolor: alpha(theme.palette.background.paper, 0.82),
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                    },
                    '&:hover .document-preview-toolbar': {
                        borderColor: alpha(theme.palette.divider, 0.9),
                        bgcolor: alpha(theme.palette.common.black, 0.04),
                    },
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'block',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            mb: 0.125,
                            fontSize: '0.68rem',
                        }}
                    >
                        Vista previa
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <Box
                    className="document-preview-toolbar"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        flexShrink: 0,
                        px: 0.5,
                        py: 0.375,
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.75),
                        bgcolor: alpha(theme.palette.common.black, 0.02),
                        transition: theme.transitions.create(['background-color', 'border-color'], {
                            duration: theme.transitions.duration.shorter,
                        }),
                    }}
                >
                    {hasMultipleImages ? (
                        <Box
                            sx={{
                                px: 1,
                                py: 0.375,
                                borderRadius: '999px',
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'text.secondary',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                letterSpacing: '0.02em',
                                lineHeight: 1,
                            }}
                        >
                            {activeIndex + 1} / {normalizedPreviewUrls.length}
                        </Box>
                    ) : null}

                    <Button
                        onClick={handleDownload}
                        startIcon={<DownloadIcon />}
                        variant="text"
                        size="small"
                        sx={{
                            minWidth: 'auto',
                            px: 1.125,
                            py: 0.625,
                            borderRadius: 999,
                            color: 'text.secondary',
                            fontWeight: 700,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                            },
                        }}
                    >
                        Descargar
                    </Button>
                    <IconButton
                        onClick={onClose}
                        size="small"
                        aria-label="Cerrar vista previa"
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.text.primary, 0.06),
                                color: 'text.primary',
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>
            <DialogContent sx={{ 
                p: 0, 
                bgcolor: '#000', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 400,
                position: 'relative'
            }}>
                {errorMessage && (
                    <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper' }}>
                        <Alert severity="error" onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    </Box>
                )}
                {activePreviewUrl && !imageLoadFailed ? (
                    <>
                        {hasMultipleImages ? (
                            <IconButton
                                onClick={handlePrevious}
                                aria-label="Ver imagen anterior"
                                sx={{
                                    position: 'absolute',
                                    left: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(255,255,255,0.16)',
                                    color: 'common.white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' },
                                }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                        ) : null}

                        <img
                            src={activePreviewUrl}
                            alt="Vista previa"
                            onError={() => {
                                const message = 'No se pudo cargar la vista previa del documento.';
                                setImageLoadFailed(true);
                                setErrorMessage(message);
                                onError?.(message);
                                showToast({ message, severity: 'error' });
                            }}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain'
                            }}
                        />

                        {hasMultipleImages ? (
                            <IconButton
                                onClick={handleNext}
                                aria-label="Ver imagen siguiente"
                                sx={{
                                    position: 'absolute',
                                    right: 16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    bgcolor: 'rgba(255,255,255,0.16)',
                                    color: 'common.white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' },
                                }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        ) : null}
                    </>
                ) : (
                    <Typography sx={{ color: 'grey.500' }}>No se pudo cargar la imagen</Typography>
                )}

                {hasMultipleImages ? (
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            gap: 1,
                            px: 2,
                            py: 1.5,
                            overflowX: 'auto',
                            bgcolor: 'rgba(0,0,0,0.45)',
                        }}
                    >
                        {normalizedPreviewUrls.map((url, index) => (
                            <Box
                                key={`${url}-${index}`}
                                onClick={() => setActiveIndex(index)}
                                sx={{
                                    width: 64,
                                    minWidth: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2px solid',
                                    borderColor: index === activeIndex ? 'primary.main' : 'transparent',
                                    cursor: 'pointer',
                                    opacity: index === activeIndex ? 1 : 0.72,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <img
                                    src={url}
                                    alt={`Vista previa ${index + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </Box>
                        ))}
                    </Box>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
