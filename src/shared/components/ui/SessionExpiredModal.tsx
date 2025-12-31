import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    LinearProgress
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useAuthStore } from '@shared/store/auth.store';

export function SessionExpiredModal() {
    const { isSessionExpired, logout } = useAuthStore();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;

        if (isSessionExpired) {
            setCountdown(5);
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isSessionExpired]);

    const handleLogout = () => {
        logout();
        // Force navigation to login just in case
        window.location.href = '/login';
    };

    if (!isSessionExpired) return null;

    return (
        <Dialog
            open={isSessionExpired}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 1,
                    textAlign: 'center'
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
                <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
            </Box>
            <DialogTitle sx={{ pb: 1 }}>Sesión Expirada</DialogTitle>
            <DialogContent>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Tu sesión ha terminado por seguridad.
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Serás redirigido al login en <strong>{countdown}</strong> segundos.
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={(5 - countdown) * 20} 
                    color="primary"
                    sx={{ height: 6, borderRadius: 3 }}
                />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                    variant="contained" 
                    onClick={handleLogout}
                    fullWidth
                    sx={{ mx: 2 }}
                >
                    Ir al Login ahora
                </Button>
            </DialogActions>
        </Dialog>
    );
}
