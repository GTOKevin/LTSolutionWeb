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
    HelpOutlineOutlined as HelpIcon,
    ArrowForwardRounded as ArrowForwardIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { APP_PATHS } from '@shared/config/app-routes';
import { loginSchema, type LoginFormData } from '../model/schema';
import { useLogin } from '../api/use-login';
import { getErrorMessage } from '@/shared/utils/api-errors';
import { EuroTransportBrand } from '@/shared/components/branding/EuroTransportBrand';
import { ThemeSwitcherMenu } from '@/shared/components/branding/ThemeSwitcherMenu';
import { BrandFooter } from '@/shared/components/branding/BrandFooter';

export function LoginForm() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const resetStatus = searchParams.get('reset');
    const resetMessage = searchParams.get('message');

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
                            backgroundColor: colors.primary,
                            color: colors.primaryContrastText,
                            '&:hover': {
                                backgroundColor: colors.primaryHover,
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
            </Box>

            {/* Footer Institutional Links */}
            <BrandFooter />
        </Box>
    );
}
