import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
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
    Visibility,
    VisibilityOff,
    PersonOutlined as PersonIcon,
    PaletteOutlined as PaletteIcon,
    Check as CheckIcon,
    HelpOutlineOutlined as HelpIcon,
    ArrowForwardRounded as ArrowForwardIcon,
    PhoneInTalkOutlined as PhoneIcon,
} from '@mui/icons-material';
import euroTransportLogo from '@/assets/img_euro/euro-transport-monogram-e-icon-only-blue-gold.svg';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { APP_PATHS } from '@shared/config/app-routes';
import { loginSchema, type LoginFormData } from '../model/schema';
import { useLogin } from '../api/use-login';
import { useThemeStore } from '@shared/store/theme.store';
import { appThemePresets } from '@/shared/config/theme/palette';
import { getErrorMessage } from '@/shared/utils/api-errors';

export function LoginForm() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { themeId, setThemeId } = useThemeStore();
    const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
    const themeMenuOpen = Boolean(themeAnchorEl);
    const [showPassword, setShowPassword] = useState(false);
    const [activeRoleSegment, setActiveRoleSegment] = useState<'operaciones' | 'clientes'>('operaciones');
    const [searchParams] = useSearchParams();
    const resetStatus = searchParams.get('reset');
    const resetMessage = searchParams.get('message');

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
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useLogin();
    const loginErrorMessage = loginMutation.isError
        ? getErrorMessage(loginMutation.error, 'No se pudo iniciar sesión.')
        : null;

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate({ name: data.nombre, password: data.clave });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            {/* Header / Brand Logo & Quick Utilities */}
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

            {/* Main Form Content Area */}
            <Box sx={{ my: 'auto', py: 4, width: '100%', maxWidth: 440, mx: 'auto' }}>
                {/* Operations Badge */}
                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '9999px',
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 246, 255, 1)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe',
                        mb: 2.5,
                    }}
                >
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isDark ? '#93c5fd' : '#1e40af' }}>
                        Portal de Operaciones v1.1
                    </Typography>
                </Box>

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        color: colors.textPrimary,
                        fontSize: { xs: '1.75rem', md: '2rem' },
                        mb: 1,
                    }}
                >
                    Bienvenido de nuevo
                </Typography>
                <Typography sx={{ color: colors.textSecondary, fontSize: '0.88rem', mb: 3, lineHeight: 1.5 }}>
                    Ingresa tus credenciales para acceder a la plataforma de gestión segura y despacho.
                </Typography>

                {/* Role Segment Switcher */}
                <Box
                    sx={{
                        display: 'flex',
                        p: 0.5,
                        borderRadius: 2.5,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                        mb: 3,
                    }}
                >
                    <Button
                        onClick={() => setActiveRoleSegment('operaciones')}
                        fullWidth
                        sx={{
                            py: 1,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: 2,
                            backgroundColor:
                                activeRoleSegment === 'operaciones'
                                    ? isDark
                                        ? 'rgba(255, 255, 255, 0.12)'
                                        : '#ffffff'
                                    : 'transparent',
                            color:
                                activeRoleSegment === 'operaciones'
                                    ? colors.textPrimary
                                    : colors.textSecondary,
                            boxShadow:
                                activeRoleSegment === 'operaciones'
                                    ? '0 1px 3px rgba(0,0,0,0.08)'
                                    : 'none',
                            '&:hover': {
                                backgroundColor:
                                    activeRoleSegment === 'operaciones'
                                        ? isDark
                                            ? 'rgba(255, 255, 255, 0.16)'
                                            : '#ffffff'
                                        : isDark
                                            ? 'rgba(255, 255, 255, 0.04)'
                                            : 'rgba(0,0,0,0.03)',
                            },
                        }}
                    >
                        Operaciones &amp; Despacho
                    </Button>
                </Box>

                {/* Form Feedback Alerts */}
                {resetStatus === 'success' && resetMessage && (
                    <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
                        {resetMessage}
                    </Alert>
                )}

                {loginErrorMessage && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                        {loginErrorMessage}
                    </Alert>
                )}

                {/* Authentication Form */}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                    {/* Username Input */}
                    <Box>
                        <Typography
                            component="label"
                            htmlFor="username"
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
                            Usuario Operativo
                        </Typography>
                        <TextField
                            id="username"
                            placeholder="usuarioxxx"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                            disabled={loginMutation.isPending}
                            autoComplete="username"
                            autoFocus
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <PersonIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
                                    </InputAdornment>
                                ),
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
                                    '& input': { py: 1.4, px: 1.75 },
                                },
                            }}
                        />
                    </Box>

                    {/* Password Input */}
                    <Box>
                        <Typography
                            component="label"
                            htmlFor="password"
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
                            Contraseña
                        </Typography>
                        <TextField
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            fullWidth
                            {...register('clave')}
                            error={!!errors.clave}
                            helperText={errors.clave?.message}
                            disabled={loginMutation.isPending}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            size="small"
                                            sx={{ color: colors.textSecondary }}
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
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
                                    '& input': { py: 1.4, px: 1.75 },
                                },
                            }}
                        />
                    </Box>

                    {/* Utilities: Remember & Forgot Password */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.25 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    sx={{
                                        color: colors.textSecondary,
                                        '&.Mui-checked': { color: colors.primary },
                                    }}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary, userSelect: 'none' }}>
                                    Recordarme en este equipo
                                </Typography>
                            }
                        />
                        <Link
                            component={RouterLink}
                            to={APP_PATHS.forgotPassword}
                            underline="hover"
                            sx={{
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: colors.primary,
                                '&:hover': { color: colors.primaryHover },
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </Stack>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        disabled={loginMutation.isPending}
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
                        {loginMutation.isPending ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <span>Acceder al Sistema</span>
                                <ArrowForwardIcon sx={{ fontSize: 18 }} />
                            </Stack>
                        )}
                    </Button>
                </Box>

                {/* 24/7 Operations Support Card */}
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
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                p: 1,
                                borderRadius: 2,
                                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                                color: isDark ? '#34d399' : '#047857',
                                display: 'flex',
                            }}
                        >
                            <PhoneIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em',
                                    color: colors.textPrimary,
                                }}
                            >
                                Central de Despacho 24/7
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: colors.textSecondary }}>
                                Pendiente • Canal Operaciones
                            </Typography>
                        </Box>
                    </Stack>
                    <Button
                        size="small"
                        sx={{
                            px: 1.5,
                            py: 0.5,
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

            {/* Footer Institutional Links */}
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
                    © 2026  S.G. Euro Transport S.A.C. Cumplimiento Normativo Garantizado.
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href="#" underline="hover" sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                        Privacidad
                    </Link>
                    <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</Typography>
                    <Link href="#" underline="hover" sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}>
                        Términos
                    </Link>
                </Stack>
            </Stack>
        </Box>
    );
}
