import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    LinearProgress,
    useTheme
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useAuthStore } from '@shared/store/auth.store';

export function SessionExpiredModal() {
    const { isSessionExpired, logout } = useAuthStore();
    const [countdown, setCountdown] = useState(5);
    const theme = useTheme();

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
        window.location.href = '/login';
    };

    if (!isSessionExpired) return null;

    return (
        <Dialog
            open={isSessionExpired}
            maxWidth="xs"
            fullWidth
            disableEscapeKeyDown
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 1,
                    textAlign: 'center',
                    borderTop: `6px solid ${theme.palette.warning.main}`
                }
            }}
            onClose={() => {}} // Disable closing by clicking outside
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3 }}>
                <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
            </Box>
            <DialogTitle sx={{ pb: 1, fontWeight: 'bold' }}>Su sesión ha expirado</DialogTitle>
            <DialogContent>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.1rem' }}>
                    Cerrando en {countdown}...
                </Typography>
                <LinearProgress 
                    variant="determinate" 
                    value={(5 - countdown) * 20} 
                    color="warning"
                    sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button 
                    variant="contained" 
                    color="warning"
                    onClick={handleLogout}
                    fullWidth
                    sx={{ mx: 2, fontWeight: 'bold' }}
                >
                    Cerrar sesión ahora
                </Button>
            </DialogActions>
        </Dialog>
    );
}
