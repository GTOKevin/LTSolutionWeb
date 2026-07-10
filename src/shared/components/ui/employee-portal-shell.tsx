import type { ReactNode } from 'react';
import {
    Box,
    Paper,
    Stack,
    Typography,
    type PaperProps,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

interface PortalPageShellProps {
    children: ReactNode;
    variant?: 'elevated' | 'flat';
}

interface PortalHeroProps {
    eyebrow?: string;
    title: string;
    description: string;
    action?: ReactNode;
    aside?: ReactNode;
    variant?: 'elevated' | 'flat';
}

interface PortalStatCardProps {
    label: string;
    value: string | number;
    helper?: string;
    icon?: ReactNode;
    accent?: 'primary' | 'success' | 'warning' | 'error';
    highlight?: boolean;
    variant?: 'elevated' | 'flat';
}

interface PortalSectionCardProps extends Omit<PaperProps, 'variant'> {
    title?: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    variant?: 'elevated' | 'flat';
}

const accentColorMap = {
    primary: 'primary.main',
    success: 'success.main',
    warning: 'warning.main',
    error: 'error.main',
} as const;

export function PortalPageShell({ children, variant = 'elevated' }: PortalPageShellProps) {
    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                gap: variant === 'flat' ? 4 : 3,
                minHeight: '100%',
                flex: '1 0 auto',
                '& > *': {
                    flexShrink: 0,
                },
                background: (theme) => variant === 'flat' ? theme.palette.background.default : `
                    radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.08)}, transparent 32%),
                    linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.default} 26%)
                `,
            }}
        >
            {children}
        </Box>
    );
}

export function PortalHero({
    eyebrow,
    title,
    description,
    action,
    aside,
    variant = 'elevated',
}: PortalHeroProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                overflow: 'hidden',
                borderRadius: variant === 'flat' ? 3 : 5,
                border: (theme) => `1px solid ${variant === 'flat' ? theme.palette.divider : alpha(theme.palette.primary.main, 0.12)}`,
                background: (theme) => variant === 'flat' 
                    ? theme.palette.background.paper
                    : `
                    linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 52%),
                    ${theme.palette.background.paper}
                `,
                boxShadow: variant === 'flat' ? 'none' : '0 24px 40px -24px rgba(15, 23, 42, 0.25)',
                pb: variant === 'flat' ? 2 : 0,
            }}
        >
            <Stack
                direction={{ xs: 'column', lg: 'row' }}
                spacing={3}
                justifyContent="space-between"
                sx={{ p: { xs: 2.5, md: 4 } }}
            >
                <Box sx={{ maxWidth: 720 }}>
                    {eyebrow ? (
                        <Typography
                            variant="overline"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: 2,
                                color: 'primary.main',
                                display: 'block',
                                mb: 1,
                            }}
                        >
                            {eyebrow}
                        </Typography>
                    ) : null}
                    <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '2.6rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 620 }}>
                        {description}
                    </Typography>
                </Box>

                <Stack
                    spacing={2}
                    alignItems={{ xs: 'stretch', lg: 'flex-end' }}
                    justifyContent="space-between"
                    sx={{ minWidth: { lg: 240 } }}
                >
                    {action ? <Box>{action}</Box> : null}
                    {aside ? (
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: 320,
                                p: 2,
                                borderRadius: 4,
                                bgcolor: (theme) => alpha(theme.palette.common.white, 0.62),
                                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            {aside}
                        </Box>
                    ) : null}
                </Stack>
            </Stack>
        </Paper>
    );
}

export function PortalStatCard({
    label,
    value,
    helper,
    icon,
    accent = 'primary',
    highlight = false,
    variant = 'elevated',
}: PortalStatCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: variant === 'flat' ? 3 : 3,
                height: '100%',
                borderRadius: variant === 'flat' ? 3 : 4,
                border: (theme) => `1px solid ${variant === 'flat' ? theme.palette.divider : alpha(theme.palette.divider, 0.8)}`,
                borderLeft: variant === 'flat' ? `4px solid` : undefined,
                borderLeftColor: variant === 'flat' ? `${accent}.main` : undefined,
                background: (theme) => {
                    if (variant === 'flat') return theme.palette.background.paper;
                    return highlight
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${theme.palette.background.paper} 65%)`
                        : theme.palette.background.paper;
                },
                boxShadow: variant === 'flat' ? 'none' : '0 18px 30px -24px rgba(15, 23, 42, 0.35)',
            }}
        >
            <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                    <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.6, color: 'text.secondary' }}>
                        {label}
                    </Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ mt: 1, lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                    {helper ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {helper}
                        </Typography>
                    ) : null}
                </Box>
                {icon ? (
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: accentColorMap[accent],
                            bgcolor: (theme) => alpha(theme.palette[accent].main, 0.12),
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                ) : null}
            </Stack>
        </Paper>
    );
}

export function PortalSectionCard({
    title,
    description,
    action,
    children,
    sx,
    variant = 'elevated',
    ...paperProps
}: PortalSectionCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: variant === 'flat' ? 3 : 4,
                border: (theme) => `1px solid ${variant === 'flat' ? theme.palette.divider : alpha(theme.palette.divider, 0.8)}`,
                backgroundColor: 'background.paper',
                boxShadow: variant === 'flat' ? 'none' : '0 22px 36px -28px rgba(15, 23, 42, 0.28)',
                overflow: 'hidden',
                ...sx,
            }}
            {...paperProps}
        >
            {(title || description || action) ? (
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    sx={{ px: 3, pt: 3, pb: children ? 2 : 3 }}
                >
                    <Box>
                        {title ? (
                            <Typography variant="h6" fontWeight={800}>
                                {title}
                            </Typography>
                        ) : null}
                        {description ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {description}
                            </Typography>
                        ) : null}
                    </Box>
                    {action ? <Box>{action}</Box> : null}
                </Stack>
            ) : null}

            <Box sx={{ px: 3, pb: 3 }}>
                {children}
            </Box>
        </Paper>
    );
}
