import {
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

interface DocumentPreviewDialogProps {
    open: boolean;
    onClose: () => void;
    previewUrl: string | null;
    title?: string;
}

export function DocumentPreviewDialog({ open, onClose, previewUrl, title = 'Vista Previa' }: DocumentPreviewDialogProps) {
    const theme = useTheme();

    const handleDownload = async () => {
        if (!previewUrl) return;
        try {
            const response = await fetch(previewUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = previewUrl.split('/').pop() || 'documento';
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading:', error);
            window.open(previewUrl, '_blank');
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
                bgcolor: alpha(theme.palette.action.hover, 0.1), 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: 400,
                position: 'relative'
            }}>
                {previewUrl ? (
                    <img 
                        src={previewUrl} 
                        alt="Vista previa" 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '80vh', 
                            objectFit: 'contain' 
                        }} 
                    />
                ) : (
                    <Typography color="text.secondary">No se pudo cargar la imagen</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
}
