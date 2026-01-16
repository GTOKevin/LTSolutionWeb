import {
    Box,
    Button,
    Card,
    Container,
    Link,
    Stack,
    TextField,
    Typography,
    useTheme,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    LockReset as LockResetIcon,
    Mail as MailIcon,
    Info as InfoIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../model/schema';
import { useForgotPassword } from '../api/use-forgot-password';
import { useState } from 'react';

export function ForgotPasswordPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mutate, isPending } = useForgotPassword();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        mutate(data.email, {
            onSuccess: (response: any) => {
                setSuccessMessage(response.message || 'Si el correo existe, se enviará un enlace de recuperación.');
            },
            onError: (error: any) => {
                setErrorMessage(error.detail || 'Ocurrió un error al procesar la solicitud.');
            },
        });
    };

    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                color: 'text.primary',
                fontFamily: '"Inter", sans-serif',
            }}
        >
            {/* Header Navigation */}
            <Box
                component="header"
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 5,
                    py: 2,
                    bgcolor: 'background.paper',
                    borderBottom: 1,
                    borderColor: 'divider',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>
                         <TruckIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: 'text.primary',
                        }}
                    >
                        HAZMAT Logistics{' '}
                        <Box
                            component="span"
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 400,
                                color: 'text.secondary',
                                ml: 0.5,
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 1,
                                border: 1,
                                borderColor: 'divider',
                                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            }}
                        >
                            CORP
                        </Box>
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Link
                        component="button"
                        underline="hover"
                        sx={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                        }}
                    >
                        Soporte Técnico
                    </Link>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/login')}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            minWidth: 84,
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </Stack>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        opacity: 0.05,
                        pointerEvents: 'none',
                        backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        background: `linear-gradient(to bottom, ${isDark ? 'rgba(10,14,26,0.8)' : 'rgba(240,242,245,0.8)'}, ${theme.palette.background.default})`,
                        pointerEvents: 'none',
                    }}
                />

                <Container maxWidth="sm" sx={{ zIndex: 10 }}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: theme.shadows[10],
                        }}
                    >
                        {/* Headline */}
                        <Stack alignItems="center" spacing={2} sx={{ mb: 4, textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'primary.main',
                                }}
                            >
                                <LockResetIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Recuperar Contraseña
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, mx: 'auto' }}>
                                    Ingresa tu correo electrónico asociado. Te enviaremos un enlace seguro para restablecer tu acceso al sistema HAZMAT.
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Form */}
                        <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)}>
                            {successMessage && (
                                <Alert severity="success" sx={{ borderRadius: 2 }}>
                                    {successMessage}
                                </Alert>
                            )}
                            {errorMessage && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {errorMessage}
                                </Alert>
                            )}

                            <Stack spacing={1}>
                                <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}
                                >
                                    <MailIcon sx={{ fontSize: 18 }} />
                                    Correo Electrónico Corporativo
                                </Typography>
                                <TextField
                                    {...register('email')}
                                    placeholder="nombre@empresa.com"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: isDark ? 'background.default' : 'grey.50',
                                        },
                                    }}
                                />
                            </Stack>

                            {/* Alert / Info Box */}
                            <Box
                                sx={{
                                    p: 1.5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    border: 1,
                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                    borderRadius: 2,
                                    display: 'flex',
                                    gap: 1.5,
                                    alignItems: 'start',
                                }}
                            >
                                <InfoIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                                    Si no recuerdas tu usuario, contacta al administrador de flota o al soporte de TI interno.
                                </Typography>
                            </Box>

                            {/* Actions */}
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={isPending}
                                    sx={{
                                        height: 48,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                    }}
                                >
                                    {isPending ? <CircularProgress size={24} color="inherit" /> : 'Enviar enlace de recuperación'}
                                </Button>
                                
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    underline="hover"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 1,
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                        fontSize: '0.875rem',
                                        '&:hover': { color: 'primary.main' },
                                    }}
                                >
                                    <ArrowBackIcon sx={{ fontSize: 18 }} />
                                    Volver al inicio de sesión
                                </Link>
                            </Stack>
                        </Stack>
                    </Card>

                    {/* Footer Text */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
                            © 2024 HAZMAT Logistics Platform v2.4. <br />
                            Sistema seguro de gestión de transporte de cargas peligrosas.
                        </Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}

// Helper for alpha color since MUI alpha utility might not be directly imported sometimes, but I imported it.
import { alpha } from '@mui/material/styles';
