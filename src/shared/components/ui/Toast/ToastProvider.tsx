import { useState, useCallback } from 'react';
import { Snackbar, type AlertColor, Box, Typography, Paper, IconButton, useTheme } from '@mui/material';
import { Close as CloseIcon, CheckCircle, Error as ErrorIcon, Info, Warning } from '@mui/icons-material';
import { ToastContext, type ToastOptions } from './ToastContext';
import { TOAST_ACTIONS, getToastMessage} from '@/shared/constants/toast.constants';

interface ToastState {
    open: boolean;
    title: string;
    message: string;
    severity: AlertColor;
    duration: number;
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const theme = useTheme();
    const [toast, setToast] = useState<ToastState>({
        open: false,
        title: '',
        message: '',
        severity: 'info',
        duration: 3000,
    });

    const showToast = useCallback(({ 
        title, 
        message, 
        entity, 
        action, 
        isError = false, 
        severity, 
        duration = 3000 
    }: ToastOptions) => {
        let finalTitle = title;
        let finalMessage = message;
        let finalSeverity = severity;

        // Auto-generate content if entity and action are provided
        if (entity && action) {
            const config = TOAST_ACTIONS[action];
            if (!finalTitle) {
                finalTitle = isError ? 'Error' : config.label;
            }
            if (!finalMessage) {
                finalMessage = getToastMessage(action, entity, isError);
            }
            if (!finalSeverity) {
                finalSeverity = isError ? 'error' : config.severity;
            }
        }

        // Fallback defaults
        if (!finalTitle) finalTitle = isError ? 'Error' : 'Notificación';
        if (!finalMessage) finalMessage = 'Operación realizada';
        if (!finalSeverity) finalSeverity = isError ? 'error' : 'info';

        setToast({ 
            open: true, 
            title: finalTitle, 
            message: finalMessage, 
            severity: finalSeverity, 
            duration 
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, open: false }));
    }, []);

    const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        hideToast();
    };

    const getIcon = (severity: AlertColor) => {
        switch (severity) {
            case 'success': return <CheckCircle sx={{ fontSize: 20, mr: 1 }} />;
            case 'error': return <ErrorIcon sx={{ fontSize: 20, mr: 1 }} />;
            case 'warning': return <Warning sx={{ fontSize: 20, mr: 1 }} />;
            case 'info': return <Info sx={{ fontSize: 20, mr: 1 }} />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={toast.duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ mt: 6 }} 
            >
                <Paper
                    elevation={6}
                    sx={{
                        width: 350,
                        overflow: 'hidden',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1,
                            bgcolor: (theme) => {
                                switch (toast.severity) {
                                    case 'success': return theme.palette.success.main;
                                    case 'error': return theme.palette.error.main;
                                    case 'warning': return theme.palette.warning.main;
                                    case 'info': return theme.palette.primary.main;
                                    default: return theme.palette.primary.main;
                                }
                            },
                            color: 'primary.contrastText'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getIcon(toast.severity)}
                            <Typography variant="subtitle2" fontWeight="bold">
                                {toast.title}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={hideToast} sx={{ color: 'inherit' }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Body */}
                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.primary">
                            {toast.message}
                        </Typography>
                    </Box>
                </Paper>
            </Snackbar>
        </ToastContext.Provider>
    );
};
