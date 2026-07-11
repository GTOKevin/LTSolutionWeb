import { useCallback, useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@shared/store/auth.store';

function SessionExpiredDialog({ onLogout }: { onLogout: () => void }) {
    const [countdown, setCountdown] = useState(5);
    const theme = useTheme();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onLogout();
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [onLogout]);

    return (
        <Dialog
            open
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
            onClose={() => {}}
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
                    onClick={onLogout}
                    fullWidth
                    sx={{ mx: 2, fontWeight: 'bold' }}
                >
                    Cerrar sesión ahora
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function SessionExpiredModal() {
    const { isSessionExpired, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login', { replace: true });
    }, [logout, navigate]);

    if (!isSessionExpired) return null;

    return <SessionExpiredDialog onLogout={handleLogout} />;
}
