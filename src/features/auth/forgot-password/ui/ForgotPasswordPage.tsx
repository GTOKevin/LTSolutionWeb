import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    MailOutlineRounded as MailIcon,
    CheckCircleRounded as CheckCircleIcon,
    ArrowForwardRounded as ArrowForwardIcon,
    ArrowBackRounded as ArrowBackIcon,
    HelpOutlineOutlined as HelpIcon,
    SupportAgentOutlined as SupportAgentIcon,
} from '@mui/icons-material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { APP_PATHS } from '@shared/config/app-routes';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../model/schema';
import { FORGOT_PASSWORD_GENERIC_MESSAGE } from '../model/constants';
import { useForgotPassword } from '../api/use-forgot-password';
import { EuroTransportBrand } from '@/shared/components/branding/EuroTransportBrand';
import { ThemeSwitcherMenu } from '@/shared/components/branding/ThemeSwitcherMenu';
import { BrandFooter } from '@/shared/components/branding/BrandFooter';
import { RecoveryProtocolPanel } from './RecoveryProtocolPanel';

export function ForgotPasswordPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { mutate, isPending } = useForgotPassword();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const colors = {
        primary: theme.palette.primary.main,
        primaryHover: theme.palette.primary.dark,
        primaryContrastText: theme.palette.primary.contrastText,
        textPrimary: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        inputBorder: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(203, 213, 225, 0.9)',
        inputBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    };

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onChange',
    });

    const emailValue = useWatch({ control, name: 'email', defaultValue: '' });
    const isEmailValid = Boolean(emailValue) && !errors.email;

    const onSubmit = (data: ForgotPasswordFormData) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        mutate(data.email, {
            onSuccess: (response) => {
                setSuccessMessage(response.message || FORGOT_PASSWORD_GENERIC_MESSAGE);
            },
            onError: () => {
                // Mensaje genérico para prevenir enumeración de usuarios
                setErrorMessage(FORGOT_PASSWORD_GENERIC_MESSAGE);
            },
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                backgroundColor: isDark ? 'background.default' : '#ffffff',
                color: 'text.primary',
                fontFamily: '"Spline Sans", "Inter", sans-serif',
            }}
        >
            {/* Left Column: Form & Recovery Options (46% on desktop) */}
            <Box
                component="main"
                sx={{
                    position: 'relative',
                    width: { xs: '100%', lg: '46%' },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 3, sm: 6, lg: 6, xl: 8 },
                    zIndex: 10,
                    backgroundColor: isDark ? 'background.paper' : '#ffffff',
                    borderRight: 1,
                    borderColor: isDark ? 'divider' : 'rgba(226, 232, 240, 0.8)',
                    boxShadow: { xs: 'none', lg: '4px 0 24px -2px rgba(15, 23, 42, 0.05)' },
                }}
            >
                {/* Header: Official Logo & Help */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ pb: 3, borderBottom: 1, borderColor: isDark ? 'divider' : 'rgba(241, 245, 249, 1)' }}
                >
                    <EuroTransportBrand />

                    {/* Header Actions: Theme & Help */}
                    <Stack sx={{ display: { xs: 'none', md: 'flex' } }} direction="row" alignItems="center" spacing={0.5}>
                        <ThemeSwitcherMenu />
                        <Tooltip title="Canal de soporte y ayuda">
                            <IconButton
                                size="small"
                                sx={{
                                    color: colors.textSecondary,
                                    p: 1,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.8)',
                                }}
                            >
                                <HelpIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Form Content Area */}
                <Box sx={{ my: 'auto', py: 4, width: '100%', maxWidth: 440, mx: 'auto' }}>
                    {/* Status Badge */}
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.75,
                            py: 0.6,
                            borderRadius: '9999px',
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 1)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
                            mb: 2.5,
                        }}
                    >
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#93c5fd' : '#1e40af' }}>
                            Recuperación de Acceso Institucional
                        </Typography>
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.025em',
                            color: colors.textPrimary,
                            fontSize: { xs: '1.75rem', md: '2rem' },
                            lineHeight: 1.2,
                            mb: 1.5,
                        }}
                    >
                        Recuperar acceso a la plataforma
                    </Typography>
                    <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem', mb: 3.5, lineHeight: 1.6 }}>
                        Introduce la dirección de correo corporativo asociada a tu perfil operativo o administrativo.
                    </Typography>

                    {/* Feedback Alerts */}
                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {/* Recovery Form */}
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography
                                component="label"
                                htmlFor="corporate-email"
                                sx={{
                                    display: 'block',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: colors.textPrimary,
                                    mb: 0.75,
                                }}
                            >
                                Correo Electrónico Corporativo
                            </Typography>
                            <TextField
                                id="corporate-email"
                                type="email"
                                placeholder="ejemplo@eurotransport.pe"
                                fullWidth
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                disabled={isPending}
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MailIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: isEmailValid ? (
                                        <InputAdornment position="end">
                                            <CheckCircleIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                                        </InputAdornment>
                                    ) : null,
                                    sx: {
                                        borderRadius: 2,
                                        backgroundColor: colors.inputBg,
                                        fontSize: '0.88rem',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: colors.inputBorder,
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: colors.textSecondary,
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: colors.primary,
                                            borderWidth: 2,
                                        },
                                        '& input': { py: 1.4, px: 1 },
                                    },
                                }}
                            />
                            <Typography sx={{ fontSize: '0.74rem', color: colors.textSecondary, mt: 0.75 }}>
                                Enviaremos un enlace de un solo uso con validez de 15 minutos.
                            </Typography>
                        </Box>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            disabled={isPending}
                            variant="contained"
                            sx={{
                                mt: 1,
                                py: 1.5,
                                borderRadius: 2.5,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                backgroundColor: colors.primary,
                                color: colors.primaryContrastText,
                                '&:hover': {
                                    backgroundColor: colors.primaryHover,
                                },
                            }}
                        >
                            {isPending ? (
                                <CircularProgress size={22} color="inherit" />
                            ) : (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <span>Enviar enlace de recuperación</span>
                                    <ArrowForwardIcon sx={{ fontSize: 18 }} />
                                </Stack>
                            )}
                        </Button>

                        {/* Back to Login Link */}
                        <Box sx={{ textAlign: 'center', pt: 1 }}>
                            <Link
                                component={RouterLink}
                                to={APP_PATHS.login}
                                underline="hover"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    color: colors.primary,
                                    '&:hover': { color: colors.primaryHover },
                                }}
                            >
                                <ArrowBackIcon sx={{ fontSize: 16 }} />
                                <span>Regresar al inicio de sesión</span>
                            </Link>
                        </Box>
                    </Box>

                    {/* Support / Locked Account Card */}
                    <Box
                        sx={{
                            mt: 4,
                            p: 2,
                            borderRadius: 2.5,
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#e0e7ff',
                                    color: isDark ? '#93c5fd' : '#1d4ed8',
                                    display: 'flex',
                                    mt: 0.25,
                                }}
                            >
                                <SupportAgentIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: colors.textPrimary, lineHeight: 1.3 }}>
                                    ¿Problemas para recibir el código o correo bloqueado?
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: colors.textSecondary, mt: 0.25 }}>
                                    Atención inmediata 24/7 para incidencias de credenciales operativas.
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Box>

                {/* Footer */}
                <BrandFooter showSupportLink />
            </Box>

            {/* Right Column: 3-Step Guided Protocol & Fleet Support (54% on desktop) */}
            <RecoveryProtocolPanel />
        </Box>
    );
}
