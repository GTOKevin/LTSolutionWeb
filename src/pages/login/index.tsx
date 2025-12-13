import { Box, Typography, Stack, useTheme, alpha } from '@mui/material';
import { LoginForm } from '@features/auth/login/ui/LoginForm';
import { SafetyCheck as SafetyCheckIcon } from '@mui/icons-material';

export function LoginPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Reference colors
    const colors = {
        primary: theme.palette.primary.main,
        bgLight: theme.palette.background.default,
        bgDark: theme.palette.background.default,
        textLight: theme.palette.text.primary,
        textDark: theme.palette.text.primary,
        surfaceLight: theme.palette.background.paper,
        surfaceDark: theme.palette.background.paper,
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                backgroundColor: isDark ? colors.bgDark : colors.bgLight,
                color: isDark ? colors.textDark : colors.textLight,
                fontFamily: '"Spline Sans", sans-serif',
            }}
        >
            {/* Left Section: Form (5 columns) */}
            <Box
                sx={{
                    position: 'relative',
                    width: { xs: '100%', lg: '41.666667%' }, // w-5/12
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 4, lg: 6, xl: 8 },
                    zIndex: 10,
                    backgroundColor: isDark ? colors.surfaceDark : colors.surfaceLight,
                    boxShadow: 24, // shadow-xl
                }}
            >
                <LoginForm />
            </Box>

            {/* Right Section: Visual (7 columns) */}
            <Box
                sx={{
                    display: { xs: 'none', lg: 'flex' },
                    position: 'relative',
                    width: '58.333333%', // w-7/12
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#111827' : '#f3f4f6',
                }}
            >
                {/* Abstract Background Image */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        height: '100%',
                        width: '100%',
                        overflow: 'hidden',
                    }}
                >
                    {/* Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: isDark ? alpha(colors.bgDark, 0.8) : alpha(colors.primary, 0.9),
                            zIndex: 10,
                            mixBlendMode: 'multiply',
                        }}
                    />
                    
                    {/* Image */}
                    <Box
                        component="div"
                        sx={{
                            height: '100%',
                            width: '100%',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1o5PAVr2Lflj7pj4ml2T9cnhO-I5plx58YO_KuhIi5Ya5mcyQL0_KN3ymdhSCz2GCysfPT3z3tu7Hg2uNWxhjnLyh4L7O5sL8WeCQg57fY7Lj4QaoOBNuOQUfj99-hwPOHO77MKHipl4oM-5_3-3dwCYKKKt2LRPG-OykeDFhU91nn7x7A4l4IfankPndak_h90e1RM6vj1QyijPS7jn7sgV4ZfRaZQjPLAnUMwzm2ll8nRqCutxlW-E14Nhi2NisSoo9dbMVvi4')",
                        }}
                    />
                    
                    {/* Pattern Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 10,
                            opacity: 0.1,
                            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                </Box>

                {/* Content Overlay */}
                <Stack
                    spacing={3}
                    sx={{
                        position: 'relative',
                        zIndex: 20,
                        maxWidth: '32rem',
                        px: 5,
                        color: 'white',
                    }}
                >
                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                height: 64,
                                width: 64,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 4,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: 24,
                            }}
                        >
                            <SafetyCheckIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Box>

                        <Typography
                            variant="h2"
                            sx={{
                                fontFamily: '"Spline Sans", sans-serif',
                                fontSize: { md: '3rem', lg: '3rem' },
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.025em',
                            }}
                        >
                            Gestión Logística <br />
                            <Box component="span" sx={{ color: isDark ? colors.primary : '#ffffff', opacity: 0.9 }}>
                                Integral
                            </Box>
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: '"Spline Sans", sans-serif',
                                fontSize: '1.125rem',
                                color: 'rgba(255, 255, 255, 0.9)',
                                lineHeight: 1.6,
                                maxWidth: '28rem',
                            }}
                        >
                            Control eficiente y seguro para el transporte de cargas críticas. Monitoreo en tiempo real y cumplimiento de normativas HAZMAT.
                        </Typography>
                    </Stack>

                    {/* Stats */}
                    <Box
                        sx={{
                            mt: 4,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 3,
                            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                            pt: 4,
                        }}
                    >
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                                99.9%
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                Uptime Operativo
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                                ISO
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                                Certificación 9001
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
