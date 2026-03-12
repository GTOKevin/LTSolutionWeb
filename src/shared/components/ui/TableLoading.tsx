import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface TableLoadingProps {
    message?: string;
    subMessage?: string;
}

export function TableLoading({ 
    message = "Obteniendo información...", 
    subMessage = "Por favor espere un momento"
}: TableLoadingProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                px: 2,
                width: '100%',
                gap: 2
            }}
        >
            <CircularProgress
                size={40}
                thickness={4}
                sx={{
                    color: theme.palette.primary.main,
                    mb: 1,
                    [`& .MuiCircularProgress-circle`]: {
                        strokeLinecap: 'round',
                    },
                }}
            />
            
            <Box sx={{ textAlign: 'center' }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        letterSpacing: 0.5
                    }}
                >
                    {message}
                </Typography>
                {subMessage && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: theme.palette.text.secondary,
                            mt: 0.5
                        }}
                    >
                        {subMessage}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
