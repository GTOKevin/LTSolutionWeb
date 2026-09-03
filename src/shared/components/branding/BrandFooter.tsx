import { Link, Stack, Typography, useTheme } from '@mui/material';
import { getBrandCopyright } from '@/shared/constants/brand';

interface BrandFooterProps {
    /** Muestra el enlace adicional "Soporte TI" (usado en recuperación de acceso). */
    showSupportLink?: boolean;
}

/**
 * Footer institucional reutilizable (copyright dinámico + enlaces legales).
 */
export function BrandFooter({ showSupportLink = false }: BrandFooterProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const color = theme.palette.text.secondary;

    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
            sx={{
                pt: 3,
                borderTop: 1,
                borderColor: isDark ? 'divider' : 'rgba(241, 245, 249, 1)',
                color,
                fontSize: '0.75rem',
            }}
        >
            <Typography sx={{ fontSize: '0.75rem', color, textAlign: { xs: 'center', sm: 'left' } }}>
                {getBrandCopyright()}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
                <Link href="#" underline="hover" sx={{ color, fontSize: '0.75rem' }}>
                    Privacidad
                </Link>
                <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</Typography>
                <Link href="#" underline="hover" sx={{ color, fontSize: '0.75rem' }}>
                    Términos
                </Link>
                {showSupportLink && (
                    <>
                        <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}>•</Typography>
                        <Link href="#" underline="hover" sx={{ color, fontSize: '0.75rem' }}>
                            Soporte TI
                        </Link>
                    </>
                )}
            </Stack>
        </Stack>
    );
}
