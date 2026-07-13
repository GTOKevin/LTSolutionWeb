import { alpha } from '@mui/material';

export type ThemeMode = 'light' | 'dark';

export function formatDate(value: string) {
    return new Date(value).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateTime(value: string) {
    return new Date(value).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function cardSx(mode: ThemeMode) {
    return {
        borderRadius: 4,
        boxShadow: mode === 'dark'
            ? '0 18px 36px rgba(0,0,0,0.28)'
            : '0 24px 40px -10px rgba(25, 28, 29, 0.06)',
        bgcolor: mode === 'dark' ? '#171c24' : '#ffffff',
    };
}

export function heroActionSx(mode: ThemeMode) {
    return {
        width: 46,
        height: 46,
        borderRadius: 2.5,
        bgcolor: mode === 'dark' ? alpha('#ffffff', 0.08) : '#f1f3f5',
        color: 'text.primary',
        '&:hover': {
            bgcolor: mode === 'dark' ? alpha('#ffffff', 0.12) : '#e7eaee',
        },
    };
}

export function tripArrowSx(mode: ThemeMode) {
    return {
        width: 42,
        height: 42,
        borderRadius: '50%',
        bgcolor: mode === 'dark' ? alpha('#ffffff', 0.08) : '#ffffff',
        border: mode === 'dark' ? `1px solid ${alpha('#ffffff', 0.08)}` : '1px solid #e5e7eb',
    };
}

export const metricLabelSx = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.18em',
    opacity: 0.82,
};

export const metricLabelDarkSx = {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.18em',
    color: 'text.secondary',
};

export const tableHeaderSx = {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'text.secondary',
};

export const tableCellSx = {
    fontSize: 13,
    fontWeight: 600,
    color: 'text.primary',
};

export const securityActionSx = {
    justifyContent: 'space-between',
    px: 1.75,
    py: 1.2,
    borderRadius: 2.5,
    textTransform: 'none',
    fontWeight: 700,
    color: '#fff',
    bgcolor: alpha('#ffffff', 0.09),
    '&:hover': {
        bgcolor: alpha('#ffffff', 0.14),
    },
    '&.Mui-disabled': {
        color: alpha('#ffffff', 0.55),
        bgcolor: alpha('#ffffff', 0.06),
    },
};
