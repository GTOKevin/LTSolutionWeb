import { ShieldOutlined, LockResetOutlined, VerifiedUserOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';
import { SectionTitle, securityActionSx } from './ProfileShared';

interface ProfileSecuritySectionProps {
    bloqueado: boolean;
    onOpenChangePassword: () => void;
}

export function ProfileSecuritySection({ bloqueado, onOpenChangePassword }: ProfileSecuritySectionProps) {
    const theme = useTheme();
    const mode = theme.palette.mode;

    return (
        <Card
            sx={{
                borderRadius: 4,
                boxShadow: mode === 'dark'
                    ? '0 16px 34px rgba(0,0,0,0.28)'
                    : '0 18px 34px rgba(15, 23, 42, 0.09)',
                bgcolor: mode === 'dark' ? '#07111f' : '#071a3d',
                color: '#fff',
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <SectionTitle
                    icon={<ShieldOutlined sx={{ color: '#d4e3ff', fontSize: 20 }} />}
                    title="Seguridad y Acceso"
                    titleColor="#fff"
                />
                <Stack spacing={1.25}>
                    <Button
                        fullWidth
                        onClick={onOpenChangePassword}
                        sx={securityActionSx}
                        endIcon={<LockResetOutlined sx={{ fontSize: 18 }} />}
                    >
                        Cambiar Contraseña
                    </Button>
                    <Button
                        fullWidth
                        disabled
                        sx={securityActionSx}
                        endIcon={<VerifiedUserOutlined sx={{ fontSize: 18 }} />}
                    >
                        MFA próximamente
                    </Button>
                    <Box
                        sx={{
                            mt: 1,
                            p: 1.75,
                            borderRadius: 2.5,
                            bgcolor: alpha('#1976d2', 0.18),
                            border: `1px solid ${alpha('#93c5fd', 0.24)}`,
                        }}
                    >
                        <Typography sx={{ fontSize: 12, lineHeight: 1.55, color: alpha('#fff', 0.88) }}>
                            {bloqueado
                                ? 'La cuenta presenta restricción temporal de acceso. Contacta al administrador si no reconoces este estado.'
                                : 'Tu cuenta utiliza un flujo de cambio de contraseña seguro y autenticado para proteger la información operativa.'}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

