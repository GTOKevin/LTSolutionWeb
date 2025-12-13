import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {
    LocalShipping as TruckIcon,
    Visibility,
    VisibilityOff,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../model/schema';
import { useLogin } from '../api/use-login';
import { useThemeStore } from '@shared/store/theme.store';
import type { ApiError } from '@shared/api/http';

export function LoginForm() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const { toggleMode } = useThemeStore();
    const [showPassword, setShowPassword] = useState(false);

    // Use theme colors directly
    const colors = {
        primary: theme.palette.primary.main,
        primaryHover: theme.palette.primary.dark,
        textPrimary: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary,
        inputBorder: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
        inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useLogin();

    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data);
    };

    return (
        <>
            {/* Header / Logo Area */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                        sx={{
                            height: 40,
                            width: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            backgroundColor: colors.primary,
                            color: 'white',
                        }}
                    >
                        <TruckIcon />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.025em',
                            color: colors.textPrimary,
                        }}
                    >
                        HAZMAT Logística
                    </Typography>
                </Stack>
                <IconButton onClick={toggleMode} sx={{ color: colors.primary }}>
                    {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
            </Stack>

            {/* Main Login Content */}
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1,
                    py: 4,
                }}
            >
                <Box mb={4}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: colors.textPrimary,
                            fontSize: { xs: '1.875rem', md: '2.25rem' },
                        }}
                    >
                        Bienvenido de nuevo
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: colors.textSecondary }}
                    >
                        Ingresa tus credenciales para acceder a la plataforma de gestión segura.
                    </Typography>
                </Box>

                {/* Error Feedback */}
                {loginMutation.isError && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3, 
                            borderRadius: 2,
                        }}
                    >
                        {(loginMutation.error as ApiError)?.detail || 'Error al iniciar sesión'}
                    </Alert>
                )}

                <Stack spacing={3}>
                    {/* Email Field */}
                    <Stack spacing={1}>
                        <Typography
                            component="label"
                            htmlFor="email"
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: colors.textPrimary,
                            }}
                        >
                            Usuario
                        </Typography>
                        <TextField
                            id="email"
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
                                        <PersonIcon sx={{ color: colors.textSecondary }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '9999px',
                                    backgroundColor: colors.inputBg,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.inputBorder,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.textSecondary,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.primary,
                                    },
                                    '& input': { py: 1.5, px: 2 },
                                },
                            }}
                        />
                    </Stack>

                    {/* Password Field */}
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography
                                component="label"
                                htmlFor="password"
                                sx={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: colors.textPrimary,
                                }}
                            >
                                Contraseña
                            </Typography>
                        </Stack>
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
                                            sx={{ color: colors.textSecondary }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: '9999px',
                                    backgroundColor: colors.inputBg,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.inputBorder,
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.textSecondary,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: colors.primary,
                                    },
                                    '& input': { py: 1.5, px: 2 },
                                },
                            }}
                        />
                    </Stack>

                    {/* Actions */}
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mt: 1 }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    sx={{
                                        color: colors.textSecondary,
                                        '&.Mui-checked': {
                                            color: colors.primary,
                                        },
                                    }}
                                />
                            }
                            label={
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: colors.textSecondary,
                                        userSelect: 'none',
                                    }}
                                >
                                    Recordarme
                                </Typography>
                            }
                        />
                        <Link
                            href="#"
                            underline="hover"
                            sx={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: colors.textSecondary,
                                '&:hover': { color: colors.primary },
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </Stack>

                    <Button
                        type="submit"
                        fullWidth
                        disabled={loginMutation.isPending}
                        variant="contained"
                        sx={{
                            mt: 2,
                            height: 48,
                            borderRadius: '9999px',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            boxShadow: 'none',
                            backgroundColor: colors.primary,
                            '&:hover': {
                                backgroundColor: colors.primaryHover,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            },
                        }}
                    >
                        {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </Stack>
            </Box>

            {/* Footer */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
                sx={{
                    textAlign: { xs: 'center', sm: 'left' },
                    color: colors.textSecondary,
                }}
            >
                <Typography variant="caption">
                    © 2024 LogisticsApp. <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Cumplimiento Normativo Garantizado.</Box>
                </Typography>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', sm: 'flex-end' }}>
                    <Link href="#" color="inherit" underline="hover" variant="caption">
                        Privacidad
                    </Link>
                    <Link href="#" color="inherit" underline="hover" variant="caption">
                        Ayuda
                    </Link>
                </Stack>
            </Stack>
        </>
    );
}
