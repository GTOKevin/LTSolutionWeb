import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import {
    Close as CloseIcon,
    LockReset as LockResetIcon,
} from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@entities/auth/api/auth.api';
import { useToast } from '@shared/components/ui/Toast';
import { PasswordField } from './PasswordField';
import { StrengthItem } from './StrengthItem';
import { getPasswordStrength } from '../lib/get-password-strength';
import {
    selfChangePasswordSchema,
    type SelfChangePasswordSchema,
} from '../model/self-change-password.schema';

interface SelfChangePasswordModalProps {
    open: boolean;
    onClose: () => void;
    usuarioNombre?: string;
    onSuccess: () => void;
}

export function SelfChangePasswordModal({ open, onClose, usuarioNombre, onSuccess }: SelfChangePasswordModalProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        watch,
        formState: { errors },
    } = useForm<SelfChangePasswordSchema>({
        resolver: zodResolver(selfChangePasswordSchema),
        mode: 'onChange',
    });

    const newPassword = watch('newPassword', '');

    const strength = useMemo(() => {
        const baseStrength = getPasswordStrength(newPassword);

        return {
            ...baseStrength,
            color: baseStrength.score <= 1
                ? theme.palette.error.main
                : baseStrength.score === 2
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
        };
    }, [newPassword, theme.palette.error.main, theme.palette.warning.main, theme.palette.success.main]);

    useEffect(() => {
        if (open) {
            setErrorMessage(null);
            reset({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        }
    }, [open, reset]);

    const mutation = useMutation({
        mutationFn: (data: SelfChangePasswordSchema) => authApi.changeOwnPassword({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        }),
        onSuccess: () => {
            showToast({
                message: `Contraseña actualizada correctamente${usuarioNombre ? ` para ${usuarioNombre}` : ''}`,
                severity: 'success',
            });
            onSuccess();
            onClose();
        },
        onError: (error: any) => {
            const apiError = error.response?.data;

            if (error.response?.status === 400 && apiError?.errors && Array.isArray(apiError.errors)) {
                let hasFieldErrors = false;

                apiError.errors.forEach((err: any) => {
                    if (err.field === 'Dto.CurrentPassword') {
                        setError('currentPassword', { type: 'server', message: err.message }, { shouldFocus: true });
                        hasFieldErrors = true;
                    }

                    if (err.field === 'Dto.NewPassword') {
                        setError('newPassword', { type: 'server', message: err.message }, { shouldFocus: !hasFieldErrors });
                        hasFieldErrors = true;
                    }
                });

                if (hasFieldErrors) {
                    return;
                }
            }

            setErrorMessage(apiError?.errors || apiError?.detail || apiError?.message || 'No se pudo actualizar la contraseña.');
        },
    });

    const onSubmit = (data: SelfChangePasswordSchema) => {
        mutation.mutate(data);
    };

    const isSubmitting = mutation.isPending;

    return (
        <Dialog
            open={open}
            onClose={isSubmitting ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                    boxShadow: theme.shadows[10],
                },
            }}
        >
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Box
                    sx={{
                        px: 3,
                        pt: 4,
                        pb: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <IconButton
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'text.secondary',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <LockResetIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>

                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Cambiar Contraseña
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2, mb: 1 }}>
                        Confirme su contraseña actual y elija una nueva clave segura para proteger su cuenta.
                    </Typography>
                </Box>

                <DialogContent sx={{ p: 3 }}>
                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage(null)}>
                            {errorMessage}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <PasswordField
                            label="Contraseña Actual"
                            placeholder="Ingrese su contraseña actual"
                            visible={showCurrentPassword}
                            onToggle={() => setShowCurrentPassword(prev => !prev)}
                            registration={register('currentPassword')}
                            error={errors.currentPassword?.message}
                            themeMode={theme.palette.mode}
                            dividerColor={theme.palette.divider}
                        />

                        <PasswordField
                            label="Nueva Contraseña"
                            placeholder="••••••••"
                            visible={showNewPassword}
                            onToggle={() => setShowNewPassword(prev => !prev)}
                            registration={register('newPassword')}
                            error={errors.newPassword?.message}
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
                                    const active = newPassword.length > 0 && (step <= strength.score + 1);
                                    let barColor = theme.palette.grey[300];
                                    if (theme.palette.mode === 'dark') {
                                        barColor = theme.palette.grey[800];
                                    }

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
                                                borderRadius: 1,
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

                        <PasswordField
                            label="Confirmar Nueva Contraseña"
                            placeholder="••••••••"
                            visible={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword(prev => !prev)}
                            registration={register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                            themeMode={theme.palette.mode}
                            dividerColor={theme.palette.divider}
                        />
                    </Box>
                </DialogContent>

                <Box
                    sx={{
                        p: 3,
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.02) : '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                    }}
                >
                    <Button
                        type="submit"
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
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        fullWidth
                        color="inherit"
                        sx={{ color: 'text.secondary' }}
                    >
                        Cancelar
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
