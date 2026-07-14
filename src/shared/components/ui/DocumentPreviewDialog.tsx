import {
    Alert,
    Box,
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    IconButton,
    useTheme,
    alpha
} from '@mui/material';
import {
    Download as DownloadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useToast } from './Toast';
import { getErrorMessage } from '@/shared/utils/api-errors';

interface DocumentPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    previewUrl: string | null;
    title?: string;
    onError?: (message: string) => void;
}

export function DocumentPreviewDialog({ open, onClose, previewUrl, title = 'Vista Previa', onError }: DocumentPreviewDialogProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setErrorMessage(null);
        setImageLoadFailed(false);
    }, [open, previewUrl]);

    const handleDownload = async () => {
        if (!previewUrl) return;
        try {
            setErrorMessage(null);
            const downloadUrl = new URL(previewUrl, window.location.origin);
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
            const filename = previewUrl.split('/').pop()?.split('?')[0] || 'documento';
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

            const fallbackWindow = window.open(previewUrl, '_blank', 'noopener,noreferrer');
            if (!fallbackWindow) {
                const popupMessage = 'No se pudo abrir el documento en una nueva pestaña.';
                setErrorMessage(popupMessage);
                onError?.(popupMessage);
                showToast({ message: popupMessage, severity: 'warning' });
            }
        }
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
            <DialogActions sx={{ 
                p: 1, 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05)
            }}>
                <Typography variant="subtitle1" sx={{ flex: 1, px: 2, fontWeight: 600 }}>
                    {title}
                </Typography>
                <Button 
                    onClick={handleDownload} 
                    startIcon={<DownloadIcon />} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }}
                >
                    Descargar
                </Button>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogActions>
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
                {previewUrl && !imageLoadFailed ? (
                    <img
                        src={previewUrl}
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
                ) : (
                    <Typography sx={{ color: 'grey.500' }}>No se pudo cargar la imagen</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
}
