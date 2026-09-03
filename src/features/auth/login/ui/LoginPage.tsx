import { Box, Typography, Stack, useTheme } from '@mui/material';
import {
    ShieldOutlined as ShieldIcon,
    LocalShippingOutlined as TruckIcon,
    DescriptionOutlined as DocumentIcon,
    WarningAmberRounded as HazmatIcon,
} from '@mui/icons-material';
import { LoginForm } from './LoginForm';

export function LoginPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

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
            {/* Left Column: Form & Utilities (45% on desktop) */}
            <Box
                component="main"
                sx={{
                    position: 'relative',
                    width: { xs: '100%', lg: '45%' },
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
                <LoginForm />
            </Box>

            {/* Right Column: Portal Dashboard Preview (55% on desktop) */}
            <Box
                component="aside"
                sx={{
                    display: { xs: 'none', lg: 'flex' },
                    position: 'relative',
                    width: '55%',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { lg: 6, xl: 8 },
                    background: 'linear-gradient(135deg, #06172c 0%, #0a2540 50%, #0c3156 100%)',
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
                        backgroundSize: '32px 32px',
                        pointerEvents: 'none',
                    },
                }}
            >
                {/* Ambient Radial Glows */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -80,
                        right: -80,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        filter: 'blur(70px)',
                        pointerEvents: 'none',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -80,
                        left: -80,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        filter: 'blur(70px)',
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
                    {/* Active Telemetry Pill */}
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.75,
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                        }}
                    >
                        <Box sx={{ position: 'relative', width: 8, height: 8 }}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    backgroundColor: '#34d399',
                                    opacity: 0.75,
                                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                                    '@keyframes ping': {
                                        '75%, 100%': { transform: 'scale(2)', opacity: 0 },
                                    },
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                }}
                            />
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#e2e8f0',
                                letterSpacing: '0.02em',
                            }}
                        >
                            Plataforma Logística Activa &amp; Monitoreada
                        </Typography>
                    </Box>

                    {/* HAZMAT Certification Pill */}
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.75,
                            py: 0.75,
                            borderRadius: '9999px',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#fbbf24',
                        }}
                    >
                        <HazmatIcon sx={{ fontSize: 16 }} />
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#cbd5e1',
                            }}
                        >
                            Certificación HAZMAT Clase 1-9
                        </Typography>
                    </Box>
                </Stack>

                {/* Central Value Proposition */}
                <Box sx={{ position: 'relative', zIndex: 10, my: 'auto', py: 6, maxWidth: 620 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            p: 1.5,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#93c5fd',
                            mb: 3,
                            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        <ShieldIcon sx={{ fontSize: 32 }} />
                    </Box>

                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: '"Spline Sans", "Inter", sans-serif',
                            fontSize: { lg: '2.5rem', xl: '3rem' },
                            fontWeight: 800,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.15,
                            color: '#ffffff',
                            mb: 2,
                        }}
                    >
                        Gestión Logística Integral
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: { lg: '1rem', xl: '1.08rem' },
                            color: '#cbd5e1',
                            lineHeight: 1.65,
                            fontWeight: 400,
                            maxWidth: 520,
                            mb: 5,
                        }}
                    >
                        Control eficiente y seguro para el transporte de cargas críticas y sobredimensionadas. Monitoreo satelital en tiempo real y riguroso cumplimiento de normativas HAZMAT.
                    </Typography>

                    {/* Live Telemetry Grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 2.5,
                            pt: 4,
                            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        }}
                    >
                        {/* Telemetry Card 1 */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    color: '#93c5fd',
                                    display: 'flex',
                                }}
                            >
                                <TruckIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                                    Flota en Ruta Activa
                                </Typography>
                                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', mt: 0.25 }}>
                                    10+ Unidades Pesadas
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, mt: 0.25 }}>
                                    100% Monitoreo GPS 24/7
                                </Typography>
                            </Box>
                        </Box>

                        {/* Telemetry Card 2 */}
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: 2.5,
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                    color: '#fcd34d',
                                    display: 'flex',
                                }}
                            >
                                <DocumentIcon sx={{ fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                                    Control Documentario
                                </Typography>
                                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', mt: 0.25 }}>
                                    Guías &amp; Manifiestos
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 600, mt: 0.25 }}>
                                    Despacho Digital Inmediato
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Footer Metrics & Corporation */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        position: 'relative',
                        zIndex: 10,
                        pt: 3,
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
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
                            Maquinaria Pesada • Cama Bajas • Carga Especial
                        </Typography>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
