import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import {
    ShieldOutlined as ShieldIcon,
    WarningAmberRounded as HazmatIcon,
    PhoneInTalkOutlined as PhoneIcon,
} from '@mui/icons-material';
import { BRAND_CONSTANTS, BRAND_METRICS } from '@/shared/constants/brand';

const STEP_CARD_SX: SxProps<Theme> = {
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
};

const STEP_NUMBER_SX: SxProps<Theme> = {
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
};

interface RecoveryStep {
    title: string;
    description: string;
}

const RECOVERY_STEPS: RecoveryStep[] = [
    {
        title: 'Solicitud de Enlace',
        description: 'Ingresas tu correo corporativo autorizado en la flota para validar tus privilegios operativos.',
    },
    {
        title: 'Verificación Segura',
        description: 'Recibes un token de un solo uso con cifrado SSL y caducidad temporal estricta de 15 minutos.',
    },
    {
        title: 'Nueva Contraseña',
        description: 'Estableces una clave segura con estándares de ciberseguridad industrial y accedes de inmediato.',
    },
];

/**
 * Panel lateral (columna derecha) de la pantalla de recuperación de acceso.
 * Contenido estático institucional, no telemetría en vivo.
 */
export function RecoveryProtocolPanel() {
    return (
        <Box
            component="aside"
            sx={{
                display: { xs: 'none', lg: 'flex' },
                position: 'relative',
                width: '54%',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingTop: { xs: 3 },
                paddingLeft: { sm: 6, lg: 8 },
                paddingRight: { sm: 6, lg: 8 },
                paddingBottom: { xs: 3 },
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
                        {BRAND_METRICS.hazmatLabel}
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
                    {RECOVERY_STEPS.map((step, index) => (
                        <Box key={step.title} sx={STEP_CARD_SX}>
                            <Box sx={STEP_NUMBER_SX}>{index + 1}</Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                                    {step.title}
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8', mt: 0.25, lineHeight: 1.45 }}>
                                    {step.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
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
                            {BRAND_METRICS.uptimeValue}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mt: 0.5, letterSpacing: '0.08em' }}>
                            {BRAND_METRICS.uptimeLabel}
                        </Typography>
                    </Box>
                    <Box sx={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
                    <Box>
                        <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                            {BRAND_METRICS.isoValue}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', mt: 0.5, letterSpacing: '0.08em' }}>
                            {BRAND_METRICS.isoLabel}
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>
                        {BRAND_CONSTANTS.regionName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', mt: 0.25 }}>
                        {BRAND_CONSTANTS.services}
                    </Typography>
                </Box>
            </Stack>
        </Box>
    );
}
