import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Link,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LockReset as LockResetIcon,
    MailOutline as MailOutlineIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { APP_PATHS } from '@shared/config/app-routes';
import { getApiError, getErrorStatus } from '@shared/utils/api-errors';
import { PasswordField } from '@features/auth/change-password/ui/PasswordField';
import { StrengthItem } from '@features/auth/change-password/ui/StrengthItem';
import { getPasswordStrength } from '@features/auth/change-password/lib/get-password-strength';
import { useResetPassword } from '../api/use-reset-password';
import { resetPasswordSchema, type ResetPasswordFormData } from '../model/schema';

const resetIllustrationUrl =
    'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=realistic%20secure%20enterprise%20access%20recovery%20screen%2C%20logistics%20operations%20center%20background%2C%20clean%20corporate%20blue%20palette%2C%20modern%20lighting%2C%20professional%20website%20illustration%2C%20no%20text%2C%20no%20watermark&image_size=landscape_16_9';

export function ResetPasswordPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onChange',
    });

    const password = useWatch({
        control,
        name: 'password',
        defaultValue: '',
    });

    const mutation = useResetPassword();
    const isDark = theme.palette.mode === 'dark';

    const strength = useMemo(() => {
        const base = getPasswordStrength(password);
        return {
            ...base,
            color: base.score <= 1
                ? theme.palette.error.main
                : base.score === 2
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
        };
    }, [password, theme.palette.error.main, theme.palette.success.main, theme.palette.warning.main]);

    const onSubmit = (data: ResetPasswordFormData) => {
        if (!token) {
            setErrorMessage('El enlace de recuperación no es válido o está incompleto.');
            return;
        }

        setErrorMessage(null);
        mutation.mutate(
            {
                token,
                newPassword: data.password,
            },
            {
                onSuccess: () => {
                    const successMessage = encodeURIComponent(
                        'Contraseña actualizada correctamente. Ahora puedes iniciar sesión con tu usuario habitual y tu nueva contraseña.'
                    );
                    navigate(`${APP_PATHS.login}?reset=success&message=${successMessage}`, { replace: true });
                },
                onError: (error) => {
                    const status = getErrorStatus(error);
                    const apiError = getApiError(error);

                    if (status === 400 || status === 404) {
                        setErrorMessage(
                            typeof apiError?.errors === 'string'
                                ? apiError.errors
                                : apiError?.detail || apiError?.message || 'El enlace de recuperación no es válido o ya expiró.'
                        );
                        return;
                    }

                    setErrorMessage('No se pudo actualizar la contraseña. Intenta nuevamente.');
                },
            }
        );
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url('${resetIllustrationUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.06,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to bottom, ${isDark ? 'rgba(10,14,26,0.9)' : 'rgba(240,242,245,0.88)'}, ${theme.palette.background.default})`,
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
                <Card
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: theme.shadows[10],
                        bgcolor: 'background.paper',
                    }}
                >
                    <Stack spacing={3}>
                        <Stack alignItems="center" spacing={2} textAlign="center">
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <LockResetIcon sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Crear nueva contraseña
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    El enlace de recuperación tiene una vigencia de 15 minutos. El acceso posterior seguirá siendo con tu usuario habitual.
                                </Typography>
                            </Box>
                        </Stack>

                        {!token ? (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                El enlace de recuperación no incluye el token requerido.
                            </Alert>
                        ) : null}

                        {errorMessage ? (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {errorMessage}
                            </Alert>
                        ) : null}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={3}>
                                <PasswordField
                                    label="Nueva Contraseña"
                                    placeholder="••••••••"
                                    visible={showPassword}
                                    onToggle={() => setShowPassword((prev) => !prev)}
                                    registration={register('password')}
                                    error={errors.password?.message}
                                    themeMode={theme.palette.mode}
                                    dividerColor={theme.palette.divider}
                                />

                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f8fafc',
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="caption" fontWeight={600}>
                                            Fuerza de la contraseña
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold" sx={{ color: strength.color, textTransform: 'uppercase' }}>
                                            {strength.label}
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={0.5} sx={{ mb: 2, height: 6 }}>
                                        {[1, 2, 3, 4].map((step) => {
                                            const active = password.length > 0 && step <= strength.score + 1;
                                            let barColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300];

                                            if (active) {
                                                if (strength.score === 0) barColor = theme.palette.error.main;
                                                else if (strength.score === 1) barColor = theme.palette.warning.main;
                                                else barColor = theme.palette.success.main;
                                            }

                                            return <Box key={step} sx={{ flex: 1, bgcolor: barColor, borderRadius: 1 }} />;
                                        })}
                                    </Stack>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        <StrengthItem label="8+ caracteres" checked={strength.hasLength} />
                                        <StrengthItem label="Una letra" checked={strength.hasLetter} />
                                        <StrengthItem label="Un símbolo" checked={strength.hasSymbol} />
                                    </Box>
                                </Box>

                                <PasswordField
                                    label="Confirmar Nueva Contraseña"
                                    placeholder="••••••••"
                                    visible={showConfirmPassword}
                                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                                    registration={register('confirmPassword')}
                                    error={errors.confirmPassword?.message}
                                    themeMode={theme.palette.mode}
                                    dividerColor={theme.palette.divider}
                                />

                                <Box
                                    sx={{
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        border: '1px solid',
                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                        borderRadius: 2,
                                        display: 'flex',
                                        gap: 1.5,
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    <MailOutlineIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.25 }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        Después del cambio, inicia sesión con tu nombre de usuario habitual. Este flujo no muestra ni envía tu usuario por correo.
                                    </Typography>
                                </Box>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={!token || mutation.isPending}
                                    sx={{ height: 48, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                                >
                                    {mutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Actualizar contraseña'}
                                </Button>
                            </Stack>
                        </Box>

                        <Link
                            component={RouterLink}
                            to={APP_PATHS.login}
                            underline="hover"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                color: 'text.secondary',
                                fontWeight: 500,
                                fontSize: '0.875rem',
                            }}
                        >
                            <ArrowBackIcon sx={{ fontSize: 18 }} />
                            Volver al inicio de sesión
                        </Link>
                    </Stack>
                </Card>
            </Container>
        </Box>
    );
}
