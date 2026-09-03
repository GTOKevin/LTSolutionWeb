import { Box, Stack, Typography, useTheme } from '@mui/material';
import euroTransportLogo from '@/assets/img_euro/euro-transport-monogram-e-icon-only-blue-gold.svg';
import { brandPalette } from '@/shared/config/theme/palette';
import { BRAND_CONSTANTS } from '@/shared/constants/brand';

/**
 * Variantes del bloque de marca:
 * - `inline`: bloque horizontal completo (logo + divisor + tipografía con claim).
 * - `compact`: variante reducida para espacios angostos (logo + divisor + tipografía
 *   sin claim, con franjas de acento alargadas). Usada en el sidebar.
 * - `icon`: solo el logo (sin divisor ni tipografía).
 */
export type EuroTransportBrandVariant = 'inline' | 'compact' | 'icon';

interface EuroTransportBrandProps {
    variant?: EuroTransportBrandVariant;
}

const BRAND_FONT = '"Barlow", "Rajdhani", "Spline Sans", sans-serif';
const TAGLINE_FONT = '"Barlow", "Spline Sans", sans-serif';

export function EuroTransportBrand({ variant = 'inline' }: EuroTransportBrandProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    if (variant === 'icon') {
        return (
            <Box
                component="img"
                src={euroTransportLogo}
                alt={BRAND_CONSTANTS.name}
                sx={{
                    height: 35,
                    width: 35,
                    objectFit: 'contain',
                    flexShrink: 0,
                    borderRadius: 1.5,
                    backgroundColor: isDark ? '#ffffff' : 'transparent',
                    p: isDark ? 0.6 : 0,
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.18)' : 'none',
                }}
            />
        );
    }

    const isCompact = variant === 'compact';
    const logoSize = isCompact ? 35 : 50;

    return (
        <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
                component="img"
                src={euroTransportLogo}
                alt={BRAND_CONSTANTS.name}
                sx={{
                    height: logoSize,
                    width: logoSize,
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
                sx={{ width: 10, height: 50, flexShrink: 0, overflow: 'visible' }}
            >
                <line
                    x1="2"
                    y1="2"
                    x2="2"
                    y2="48"
                    stroke={isDark ? 'rgba(255, 255, 255, 0.22)' : '#CBD5E1'}
                    strokeWidth="1.5"
                />
                <polygon points="2,21 8,25 2,29" fill={brandPalette.gold} />
            </Box>

            {/* Typography Branding Block */}
            <Stack spacing={0.15} sx={{ userSelect: 'none' }}>
                <Typography
                    sx={{
                        fontFamily: BRAND_FONT,
                        fontSize: isCompact ? '0.44rem' : '0.64rem',
                        fontWeight: 700,
                        letterSpacing: '0.24em',
                        textTransform: 'uppercase',
                        color: isDark ? '#94A3B8' : '#475569',
                        lineHeight: 1.2,
                    }}
                >
                    {BRAND_CONSTANTS.taglineTop}
                </Typography>

                <Typography
                    sx={{
                        fontFamily: BRAND_FONT,
                        fontSize: isCompact ? '0.9rem' : '1.38rem',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        lineHeight: 1.05,
                        my: 0.1,
                    }}
                >
                    {BRAND_CONSTANTS.name}
                </Typography>

                {/* Bottom Accents & Tagline */}
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Box
                        sx={{
                            height: 3,
                            width: isCompact ? 45 : 42,
                            backgroundColor: brandPalette.gold,
                            borderRadius: '1px',
                            flexShrink: 0,
                        }}
                    />
                    <Box
                        sx={{
                            height: 3,
                            width: isCompact ? 110 : 9,
                            backgroundColor: isDark ? theme.palette.primary.main : brandPalette.corporateBlue,
                            borderRadius: '1px',
                            flexShrink: 0,
                        }}
                    />
                    {!isCompact && (
                        <Typography
                            sx={{
                                fontFamily: TAGLINE_FONT,
                                fontSize: '0.5rem',
                                fontWeight: 600,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: isDark ? '#94A3B8' : '#475569',
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {BRAND_CONSTANTS.claim}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
}
