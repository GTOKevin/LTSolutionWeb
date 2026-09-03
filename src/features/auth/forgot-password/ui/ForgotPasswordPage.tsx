import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
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
    ShieldOutlined as ShieldIcon,
    WarningAmberRounded as HazmatIcon,
    PhoneInTalkOutlined as PhoneIcon,
    PaletteOutlined as PaletteIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { APP_PATHS } from '@shared/config/app-routes';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../model/schema';
import { appThemePresets } from '@/shared/config/theme/palette';
import { useForgotPassword } from '../api/use-forgot-password';
import euroTransportLogo from '@/assets/img_euro/euro-transport-monogram-e-icon-only-blue-gold.svg';
import { useThemeStore } from '@/shared/store/theme.store';

export function ForgotPasswordPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { mutate, isPending } = useForgotPassword();
    const { themeId, setThemeId } = useThemeStore();
    const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
    const themeMenuOpen = Boolean(themeAnchorEl);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const colors = {
        primary: theme.palette.primary.main,
        primaryHover: theme.palette.primary.dark,
        textPrimary: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        inputBorder: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(203, 213, 225, 0.9)',
        inputBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    };

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onChange',
    });

    const emailValue = watch('email');
    const isEmailValid = emailValue && !errors.email && emailValue.includes('@');

    const onSubmit = (data: ForgotPasswordFormData) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        mutate(data.email, {
            onSuccess: (response) => {
                setSuccessMessage(response.message || 'Si el correo existe, se enviará un enlace de recuperación.');
            },
            onError: () => {
                // Mensaje genérico para prevenir enumeración de usuarios
                setErrorMessage('Si el correo existe, se enviará un enlace de recuperación.');
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
                    {/* Official Logo Block */}
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            component="img"
                            src={euroTransportLogo}
                            alt="Euro Transport"
                            sx={{
                                height: 50,
                                width: 50,
                                objectFit: 'contain',
                                flexShrink: 0,
                                borderRadius: 1.5,
                                backgroundColor: isDark ? '#ffffff' : 'transparent',
                                p: isDark ? 0.6 : 0,
                                boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                            }}
                        />

                        {/* Divider with Golden Arrow Indicator */}
                        <Box
                            component="svg"
                            viewBox="0 0 10 50"
                            sx={{
                                width: 10,
                                height: 50,
                                flexShrink: 0,
                                overflow: 'visible',
                            }}
                        >
                            <line
                                x1="2"
                                y1="2"
                                x2="2"
                                y2="48"
                                stroke={isDark ? 'rgba(255, 255, 255, 0.22)' : '#CBD5E1'}
                                strokeWidth="1.5"
                            />
                            <polygon points="2,21 8,25 2,29" fill="#EAB308" />
                        </Box>

                        {/* Typography Branding Block */}
                        <Stack spacing={0.15} sx={{ userSelect: 'none' }}>
                            <Typography
                                sx={{
                                    fontFamily: '"Barlow", "Rajdhani", "Spline Sans", sans-serif',
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.24em',
                                    textTransform: 'uppercase',
                                    color: isDark ? '#94A3B8' : '#475569',
                                    lineHeight: 1.2,
                                }}
                            >
                                SERVICIOS GENERALES
                            </Typography>

                            <Typography
                                sx={{
                                    fontFamily: '"Barlow", "Rajdhani", "Spline Sans", sans-serif',
                                    fontSize: '1.38rem',
                                    fontWeight: 900,
                                    letterSpacing: '0.06em',
                                    color: isDark ? '#F8FAFC' : '#0F172A',
                                    lineHeight: 1.05,
                                    my: 0.1,
                                }}
                            >
                                EURO TRANSPORT
                            </Typography>

                            {/* Bottom Accents & Tagline */}
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                    sx={{
                                        height: 3,
                                        width: 42,
                                        backgroundColor: '#EAB308',
                                        borderRadius: '1px',
                                        flexShrink: 0,
                                    }}
                                />
                                <Box
                                    sx={{
                                        height: 3,
                                        width: 9,
                                        backgroundColor: isDark ? colors.primary : '#0B2B68',
                                        borderRadius: '1px',
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontFamily: '"Barlow", "Spline Sans", sans-serif',
                                        fontSize: '0.5rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.14em',
                                        textTransform: 'uppercase',
                                        color: isDark ? '#94A3B8' : '#475569',
                                        lineHeight: 1,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    TRANSPORTE DE CARGA Y MAQUINARIA PESADA
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>

                    {/* Header Actions: Theme & Help */}
                    <Stack sx={{ display: { xs: 'none', md: 'flex' } }} direction="row" alignItems="center" spacing={0.5}>
                        <Tooltip title="Seleccionar tema visual">
                            <IconButton
                                onClick={(e) => setThemeAnchorEl(e.currentTarget)}
                                size="small"
                                sx={{
                                    color: colors.primary,
                                    p: 1,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(226,232,240,0.8)',
                                }}
                            >
                                <PaletteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={themeAnchorEl}
                            open={themeMenuOpen}
                            onClose={() => setThemeAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            {[
                                appThemePresets.logistica_light,
                                appThemePresets.logistica_dark,
                                appThemePresets.midnight_tech,
                                appThemePresets.nordic_ice,
                                appThemePresets.sunset_express,
                            ].map((t) => (
                                <MenuItem
                                    key={t.id}
                                    selected={t.id === themeId}
                                    onClick={() => {
                                        setThemeId(t.id);
                                        setThemeAnchorEl(null);
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 34 }}>
                                        {t.id === themeId ? <CheckIcon fontSize="small" /> : null}
                                    </ListItemIcon>
                                    <ListItemText>{t.label}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>

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
                                backgroundColor: '#0d47a1',
                                color: '#ffffff',
                                boxShadow: '0 4px 14px 0 rgba(13, 71, 161, 0.25)',
                                '&:hover': {
                                    backgroundColor: '#0b3c8a',
                                    boxShadow: '0 6px 20px 0 rgba(13, 71, 161, 0.35)',
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
                            justifyContent: 'space-between',
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
                        <Button
                            size="small"
                            sx={{
                                whiteSpace: 'nowrap',
                                px: 1.5,
                                py: 0.6,
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderRadius: 1.5,
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                                color: colors.textPrimary,
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                '&:hover': {
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#f1f5f9',
                                },
                            }}
                        >
                            Pendiente
                        </Button>
                    </Box>
                </Box>

                {/* Footer */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                        pt: 3,
                        borderTop: 1,
                        borderColor: isDark ? 'divider' : 'rgba(241, 245, 249, 1)',
                        color: colors.textSecondary,
                        fontSize: '0.75rem',
                    }}
                >
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, textAlign: { xs: 'center', sm: 'left' } }}>
                        © 2024 Euro Transport. Cumplimiento Normativo Garantizado.
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Link href="#" underline="hover" sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                            Privacidad
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</Typography>
                        <Link href="#" underline="hover" sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                            Términos
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</Typography>
                        <Link href="#" underline="hover" sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                            Soporte TI
                        </Link>
                    </Stack>
                </Stack>
            </Box>

            {/* Right Column: 3-Step Guided Protocol & Fleet Support (54% on desktop) */}
            <Box
                component="aside"
                sx={{
                    display: { xs: 'none', lg: 'flex' },
                    position: 'relative',
                    width: '54%',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { lg: 6, xl: 8 },
                    background: 'linear-gradient(135deg, #071526 0%, #081a36 50%, #0c2340 100%)',
                    color: '#ffffff',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `
                            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
                        `,
                        backgroundSize: '36px 36px',
                        pointerEvents: 'none',
                    },
                }}
            >
                {/* Radial Lighting */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 420,
                        height: 420,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(30, 64, 175, 0.25)',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -60,
                        left: -60,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(13, 148, 136, 0.12)',
                        filter: 'blur(80px)',
                        pointerEvents: 'none',
                    }}
                />

                {/* Top Status & Security Badges */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ position: 'relative', zIndex: 10 }}
                >
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.75,
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(51, 65, 85, 0.8)',
                        }}
                    >
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#34d399' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                            Plataforma Logística Activa &amp; Monitoreada
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.75,
                            py: 0.75,
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(51, 65, 85, 0.8)',
                            color: '#fbbf24',
                        }}
                    >
                        <HazmatIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>
                            Certificación HAZMAT Clase 1-9
                        </Typography>
                    </Box>
                </Stack>

                {/* Center: 3-Step Restoration Protocol */}
                <Box sx={{ position: 'relative', zIndex: 10, my: 'auto', py: 5, maxWidth: 580 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 1.25,
                            borderRadius: 3,
                            backgroundColor: 'rgba(15, 41, 82, 0.8)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            color: '#60a5fa',
                            mb: 2.5,
                            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <ShieldIcon sx={{ fontSize: 28 }} />
                    </Box>

                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: '"Spline Sans", "Inter", sans-serif',
                            fontSize: { lg: '2.25rem', xl: '2.6rem' },
                            fontWeight: 800,
                            letterSpacing: '-0.025em',
                            lineHeight: 1.15,
                            color: '#ffffff',
                            mb: 1.5,
                        }}
                    >
                        Protocolo Seguro de Restauración
                    </Typography>

                    <Typography sx={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, mb: 4 }}>
                        Garantizamos la trazabilidad y la integridad de acceso a nuestros sistemas de telemetría y despacho de carga sobredimensionada.
                    </Typography>

                    {/* Step Cards List */}
                    <Stack spacing={2} sx={{ mb: 3.5 }}>
                        {/* Step 1 */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(51, 65, 85, 0.7)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                transition: 'border-color 0.2s',
                                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.5)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(37, 99, 235, 0.25)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    color: '#60a5fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    flexShrink: 0,
                                }}
                            >
                                1
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                                    Solicitud de Enlace
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.25, lineHeight: 1.45 }}>
                                    Ingresas tu correo corporativo autorizado en la flota para validar tus privilegios operativos.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Step 2 */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(51, 65, 85, 0.7)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                transition: 'border-color 0.2s',
                                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.5)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(37, 99, 235, 0.25)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    color: '#60a5fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    flexShrink: 0,
                                }}
                            >
                                2
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                                    Verificación Segura
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.25, lineHeight: 1.45 }}>
                                    Recibes un token de un solo uso con cifrado SSL y caducidad temporal estricta de 15 minutos.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Step 3 */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(51, 65, 85, 0.7)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                transition: 'border-color 0.2s',
                                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.5)' },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 2,
                                    backgroundColor: 'rgba(37, 99, 235, 0.25)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    color: '#60a5fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    flexShrink: 0,
                                }}
                            >
                                3
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                                    Nueva Contraseña
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.25, lineHeight: 1.45 }}>
                                    Estableces una clave segura con estándares de ciberseguridad industrial y accedes de inmediato.
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    {/* Fleet Support Notice */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2.5,
                            background: 'linear-gradient(to right, rgba(30, 58, 138, 0.4), rgba(15, 23, 42, 0.6))',
                            border: '1px solid rgba(96, 165, 250, 0.25)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.75,
                        }}
                    >
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#93c5fd',
                                display: 'flex',
                            }}
                        >
                            <PhoneIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                                Soporte de Flota y Operadores
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                                Pendiente
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Footer Metrics */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        position: 'relative',
                        zIndex: 10,
                        pt: 3,
                        borderTop: '1px solid rgba(51, 65, 85, 0.6)',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={4}>
                        <Box>
                            <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                                99.9%
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mt: 0.5, letterSpacing: '0.08em' }}>
                                Uptime Operativo
                            </Typography>
                        </Box>
                        <Box sx={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                        <Box>
                            <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                                ISO
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mt: 0.5, letterSpacing: '0.08em' }}>
                                Certificación 9001:2015
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>
                            EURO TRANSPORT PERÚ
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.25 }}>
                            Maquinaria Pesada • Cama Bajas • Furgones
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
