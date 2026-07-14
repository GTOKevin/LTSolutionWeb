import {
    Dialog,
    DialogContent,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    useTheme,
    alpha,
    Stack
} from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { usuarioApi } from '@entities/usuario/api/usuario.api';
import { useState, useEffect, useMemo } from 'react';
import { 
    Visibility, 
    VisibilityOff, 
    LockReset as LockResetIcon, 
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as CircleIcon
} from '@mui/icons-material';
import { useToast } from '@/shared/components/ui/Toast';
import { changePasswordSchema, type ChangePasswordSchema } from '../model/schema';
import { getApiError, getErrorStatus } from '@/shared/utils/api-errors';
import { getPasswordStrength } from '@/features/auth/change-password/lib/get-password-strength';

interface ChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
    usuarioId: number | null;
    usuarioNombre?: string;
    onSuccess: () => void;
}

export function ChangePasswordModal({ open, onClose, usuarioId, usuarioNombre, onSuccess }: ChangePasswordModalProps) {
    const theme = useTheme();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { showToast } = useToast();
    const {
        register,
        handleSubmit,
        reset,
        control,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<ChangePasswordSchema>({
        resolver: zodResolver(changePasswordSchema),
        mode: 'onChange'
    });

    const password = useWatch({
        control,
        name: 'password',
        defaultValue: ''
    });

    // Password Strength Logic
    const strength = useMemo(() => {
        const baseStrength = getPasswordStrength(password);

        return {
            ...baseStrength,
            color: baseStrength.score <= 1
                ? theme.palette.error.main
                : baseStrength.score === 2
                    ? theme.palette.warning.main
                    : theme.palette.success.main
        };
    }, [password, theme]);

    useEffect(() => {
        if (open) {
            reset({ password: '', confirmPassword: '' });
            const resetUiTimer = window.setTimeout(() => {
                setErrorMessage(null);
                setShowPassword(false);
                setShowConfirmPassword(false);
            }, 0);

            return () => {
                window.clearTimeout(resetUiTimer);
            };
        }
    }, [open, reset]);

    const mutation = useMutation({
        mutationFn: (data: ChangePasswordSchema) => {
            if (!usuarioId) throw new Error("No user ID provided");
            return usuarioApi.updatePassword(usuarioId, data.password);
        },
        onSuccess: () => {
            showToast({
                message: `Contraseña cambiada exitosamente para ${usuarioNombre || 'el usuario'}`,
                severity: 'success'
            });
            onSuccess();
            onClose();
        },
        onError: (error: unknown) => {
            const apiError = getApiError(error);
            const statusCode = getErrorStatus(error);

            if (statusCode === 400 && apiError?.errors && Array.isArray(apiError.errors)) {
                let hasFieldErrors = false;
                const modelErrors: string[] = [];

                apiError.errors.forEach((err) => {
                    if (!err.message) {
                        return;
                    }

                    if (err.field === 'NuevaClave') {
                        setError('password', {
                            type: 'server',
                            message: err.message
                        }, { shouldFocus: true });
                        hasFieldErrors = true;
                        return;
                    }

                    modelErrors.push(err.message);
                });

                if (modelErrors.length > 0) {
                    setErrorMessage(Array.from(new Set(modelErrors)).join('\n'));
                    return;
                }

                if (hasFieldErrors) return;
            }

            if (typeof apiError?.errors === 'string') {
                setErrorMessage(apiError.errors);
                return;
            }

            setErrorMessage(apiError?.message || apiError?.detail || 'Error al cambiar la contraseña');
        }
    });

    const onSubmit = (data: ChangePasswordSchema) => {
        mutation.mutate(data);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { 
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                    boxShadow: theme.shadows[10]
                }
            }}
        >
            {/* Header Section */}
            <Box sx={{ 
                px: 3, 
                pt: 4, 
                pb: 2, 
                borderBottom: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <IconButton 
                    onClick={onClose}
                    sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        color: 'text.secondary'
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <LockResetIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                </Box>

                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Cambio de Contraseña
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, mb: 1 }}>
                    Elija una contraseña segura que no haya utilizado anteriormente para proteger la cuenta de <strong>{usuarioNombre}</strong>.
                </Typography>
            </Box>
            
            <DialogContent sx={{ p: 3 }}>
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                        {errorMessage}
                    </Alert>
                )}

                <form id="change-password-form" onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* New Password Field */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Nueva Contraseña
                            </Typography>
                            <TextField
                                placeholder="••••••••"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        pr: 0
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" sx={{ mr: 2.5 }}>
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ 
                                                    borderLeft: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '0 8px 8px 0',
                                                    px: 2,
                                                    height: '100%',
                                                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f8fafc',
                                                    '&:hover': {
                                                        bgcolor: theme.palette.action.hover
                                                    }
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Password Strength Indicator */}
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f8fafc',
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="caption" fontWeight={600}>
                                    Fuerza de la contraseña
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" sx={{ color: strength.color, textTransform: 'uppercase' }}>
                                    {strength.label}
                                </Typography>
                            </Box>
                            
                            {/* Segmented Progress */}
                            <Stack direction="row" spacing={0.5} sx={{ mb: 2, height: 6 }}>
                                {[1, 2, 3, 4].map((step) => {

                                    const active = password.length > 0 && (step <= strength.score + 1);
                                    let barColor = theme.palette.grey[300];
                                    if (theme.palette.mode === 'dark') barColor = theme.palette.grey[800];

                                    if (active) {
                                        if (strength.score === 0) barColor = theme.palette.error.main;
                                        else if (strength.score === 1) barColor = theme.palette.warning.main;
                                        else if (strength.score >= 2) barColor = theme.palette.success.main;
                                    }

                                    return (
                                        <Box 
                                            key={step} 
                                            sx={{ 
                                                flex: 1, 
                                                bgcolor: barColor, 
                                                borderRadius: 1 
                                            }} 
                                        />
                                    );
                                })}
                            </Stack>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <StrengthItem label="8+ caracteres" checked={strength.hasLength} />
                                <StrengthItem label="Mayúscula" checked={strength.hasUpper} />
                                <StrengthItem label="Un símbolo" checked={strength.hasSymbol} />
                            </Box>
                        </Box>

                        {/* Confirm Password Field */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Confirmar Nueva Contraseña
                            </Typography>
                            <TextField
                                placeholder="••••••••"
                                type={showConfirmPassword ? 'text' : 'password'}
                                fullWidth
                                {...register('confirmPassword')}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        pr: 0
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" sx={{ mr: 2.5 }}>
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                sx={{ 
                                                    borderLeft: `1px solid ${theme.palette.divider}`,
                                                    borderRadius: '0 8px 8px 0',
                                                    px: 2,
                                                    height: '100%',
                                                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f8fafc',
                                                    '&:hover': {
                                                        bgcolor: theme.palette.action.hover
                                                    }
                                                }}
                                            >
                                                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    </Box>
                </form>
            </DialogContent>

            <Box sx={{ p: 3, bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                    type="submit" 
                    form="change-password-form" 
                    variant="contained" 
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    sx={{ boxShadow: 2 }}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    Actualizar Contraseña
                </Button>
                <Button 
                    onClick={onClose} 
                    disabled={isSubmitting}
                    fullWidth
                    color="inherit"
                    sx={{ color: 'text.secondary' }}
                >
                    Cancelar
                </Button>
            </Box>
        </Dialog>
    );
}

function StrengthItem({ label, checked }: { label: string; checked: boolean }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {checked ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
                <CircleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            )}
            <Typography variant="caption" color={checked ? 'text.primary' : 'text.disabled'}>
                {label}
            </Typography>
        </Box>
    );
}
