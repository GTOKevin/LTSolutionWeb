import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    useTheme,
    alpha
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    content: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    severity?: 'primary' | 'error' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    title,
    content,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onClose,
    severity = 'primary',
    isLoading = false
}: ConfirmDialogProps) {
    const theme = useTheme();

    const getColor = () => {
        switch (severity) {
            case 'error': return theme.palette.error;
            case 'warning': return theme.palette.warning;
            case 'info': return theme.palette.info;
            default: return theme.palette.primary;
        }
    };

    const color = getColor();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { borderRadius: 3, maxWidth: 450 }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(color.main, 0.05),
                color: color.main,
                fontWeight: 'bold'
            }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <DialogContentText color="text.primary">
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    color={severity}
                    disabled={isLoading}
                    sx={{ boxShadow: 'none' }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
