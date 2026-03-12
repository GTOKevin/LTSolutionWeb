import { Dialog, Box, CircularProgress, Typography, useTheme, alpha } from '@mui/material';

interface LoadingModalProps {
    open: boolean;
    message?: string;
}

export function LoadingModal({ open, message = "Cargando..." }: LoadingModalProps) {
    const theme = useTheme();

    return (
        <Dialog 
            open={open} 
            PaperProps={{
                sx: { 
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo oscuro con buena opacidad
                        backdropFilter: 'blur(3px)', // Efecto de desenfoque sutil en el fondo
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }
                }
            }}
            disableEscapeKeyDown
            onClose={() => {}} 
        >
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 3,
                    p: 5,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[10],
                    minWidth: 320,
                    outline: 'none',
                    zIndex: (theme) => theme.zIndex.drawer + 10
                }}
            >
                {/* Spinner con diseño moderno */}
                <Box sx={{ position: 'relative', display: 'flex' }}>
                    <CircularProgress 
                        size={60} 
                        thickness={2} 
                        sx={{ 
                            color: alpha(theme.palette.primary.main, 0.2),
                            position: 'absolute',
                            left: 0,
                        }}
                        variant="determinate"
                        value={100}
                    />
                    <CircularProgress 
                        size={60} 
                        thickness={4} 
                        sx={{ 
                            color: theme.palette.primary.main,
                            animationDuration: '1.5s',
                            [`& .MuiCircularProgress-circle`]: {
                                strokeLinecap: 'round',
                            },
                        }}
                        disableShrink
                    />
                </Box>
                
                {/* Mensaje sutil */}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        opacity: 0.9,
                        fontFamily: "system-ui"
                    }}
                >
                    {message}
                </Typography>
            </Box>
        </Dialog>
    );
}
