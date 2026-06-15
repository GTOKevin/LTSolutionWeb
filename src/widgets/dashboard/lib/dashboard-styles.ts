import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material';

export const DASHBOARD_AMBIENT_SHADOW = '0 24px 40px -10px rgba(25, 28, 29, 0.06)';

export function dashboardCardSx(theme: Theme) {
    return {
        borderRadius: 4,
        boxShadow: DASHBOARD_AMBIENT_SHADOW,
        border: `1px solid ${alpha(theme.palette.common.white, 0.6)}`,
        bgcolor: theme.palette.background.paper,
        backgroundImage: 'none',
    };
}

export function tableHeaderCellSx(theme: Theme) {
    return {
        bgcolor: alpha(theme.palette.text.primary, 0.03),
        color: theme.palette.text.secondary,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
    };
}

export function tripStatusChipSx(theme: Theme, tone: 'active' | 'scheduled' | 'completed' | 'default') {
    if (tone === 'active') {
        return {
            bgcolor: alpha(theme.palette.success.main, 0.12),
            color: theme.palette.success.dark,
            fontWeight: 700,
        };
    }

    if (tone === 'scheduled') {
        return {
            bgcolor: alpha(theme.palette.info.main, 0.12),
            color: theme.palette.info.dark,
            fontWeight: 700,
        };
    }

    if (tone === 'completed') {
        return {
            bgcolor: alpha(theme.palette.text.primary, 0.08),
            color: theme.palette.text.secondary,
            fontWeight: 700,
        };
    }

    return {
        bgcolor: alpha(theme.palette.warning.main, 0.12),
        color: theme.palette.warning.dark,
        fontWeight: 700,
    };
}

export function notificationIconSx(theme: Theme, tone: 'critical' | 'warning' | 'info') {
    if (tone === 'critical') {
        return {
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(theme.palette.error.main, 0.12),
            color: theme.palette.error.main,
            flexShrink: 0,
        };
    }

    if (tone === 'warning') {
        return {
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(theme.palette.warning.main, 0.12),
            color: theme.palette.warning.main,
            flexShrink: 0,
        };
    }

    return {
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha(theme.palette.info.main, 0.12),
        color: theme.palette.info.main,
        flexShrink: 0,
    };
}
