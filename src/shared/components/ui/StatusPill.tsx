import { Box, Typography, useTheme, alpha } from '@mui/material';
import type { Theme } from '@mui/material/styles';

export type StatusPillTone = 'info' | 'warning' | 'secondary' | 'success' | 'neutral';

interface StatusPillProps {
    label: string;
    tone?: StatusPillTone;
    size?: 'small' | 'medium';
}

interface StatusPillColors {
    bg: string;
    color: string;
    borderColor: string;
    dotColor: string;
}

function resolveStatusPillColors(theme: Theme, tone: StatusPillTone): StatusPillColors {
    switch (tone) {
        case 'info':
            return {
                bg: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                borderColor: alpha(theme.palette.info.main, 0.25),
                dotColor: theme.palette.info.main,
            };
        case 'warning':
            return {
                bg: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.dark,
                borderColor: alpha(theme.palette.warning.main, 0.3),
                dotColor: theme.palette.warning.main,
            };
        case 'secondary':
            return {
                bg: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
                borderColor: alpha(theme.palette.secondary.main, 0.3),
                dotColor: theme.palette.secondary.main,
            };
        case 'success':
            return {
                bg: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.dark,
                borderColor: alpha(theme.palette.success.main, 0.3),
                dotColor: theme.palette.success.main,
            };
        default:
            return {
                bg: alpha(theme.palette.text.secondary, 0.1),
                color: theme.palette.text.secondary,
                borderColor: alpha(theme.palette.divider, 0.8),
                dotColor: theme.palette.text.secondary,
            };
    }
}

export function StatusPill({
    label,
    tone = 'neutral',
    size = 'medium',
}: StatusPillProps) {
    const theme = useTheme();
    const colors = resolveStatusPillColors(theme, tone);
    const isSmall = size === 'small';

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: colors.bg,
                color: colors.color,
                border: '1px solid',
                borderColor: colors.borderColor,
                borderRadius: '999px',
                px: isSmall ? 1.25 : 1.5,
                py: isSmall ? 0.45 : 0.6,
            }}
        >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.dotColor }} />
            <Typography
                sx={{
                    fontSize: isSmall ? '0.7rem' : '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    lineHeight: 1,
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}