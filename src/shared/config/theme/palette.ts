export const themePalette = {
    primary: {
        main: '#0d47a1', // Light mode default
        light: '#5472d3',
        dark: '#002171',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#ff6f00',
        light: '#ffa040',
        dark: '#c43e00',
        contrastText: '#000000',
    },
    warning: {
        main: '#ffd600',
        light: '#ffff52',
        dark: '#c7a500',
    },
    error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
    },
    success: {
        main: '#388e3c',
        light: '#66bb6a',
        dark: '#2e7d32',
    },
    background: {
        light: {
            default: '#f0f2f5',
            paper: '#ffffff',
        },
        dark: {
            default: '#0a0e1a',
            paper: '#1a1f2e',
        }
    },
    text: {
        light: {
            primary: '#1a1a1a',
            secondary: '#5f6368',
        },
        dark: {
            primary: '#e0e0e0',
            secondary: '#9e9e9e',
        }
    },
    common: {
        white: '#ffffff',
        black: '#000000',
        border: '#e0e0e0',
        tableHeader: '#f5f5f5'
    }
};

/**
 * Colores de marca de Euro Transport.
 *
 * Tokens centralizados para el branding (logo, divisor y acentos).
 * NO usar hex sueltos de estos colores en componentes; consumir desde aquí.
 */
export const brandPalette = {
    /** Dorado de acento institucional (flecha del divisor y franja principal). */
    gold: '#EAB308',
    /** Azul corporativo de la franja secundaria del branding. */
    corporateBlue: '#0B2B68',
} as const;

export type AppThemeMode = 'light' | 'dark';

export type AppThemeId =
    | 'logistica_light'
    | 'logistica_dark'
    | 'midnight_tech'
    | 'nordic_ice'
    | 'sunset_express';

type MUIThemePalette = {
    divider: string;
    primary: { main: string; contrastText?: string };
    secondary: { main: string; contrastText?: string };
    error: { main: string };
    warning: { main: string };
    success: { main: string };
    background: { default: string; paper: string };
    text: { primary: string; secondary: string };
};

export type AppThemePreset = {
    id: AppThemeId;
    label: string;
    mode: AppThemeMode;
    shapeBorderRadius: number;
    palette: MUIThemePalette;
};

export type ThemePreviewSwatch = {
    color: string;
    label: string;
};

export const appThemePresets: Record<AppThemeId, AppThemePreset> = {
    logistica_light: {
        id: 'logistica_light',
        label: 'Nordic Classic',
        mode: 'light',
        shapeBorderRadius: 4,
        palette: {
            divider: themePalette.common.border,
            primary: { main: themePalette.primary.main, contrastText: themePalette.primary.contrastText },
            secondary: { main: themePalette.secondary.main, contrastText: themePalette.secondary.contrastText },
            error: { main: themePalette.error.main },
            warning: { main: themePalette.warning.main },
            success: { main: themePalette.success.main },
            background: { default: themePalette.background.light.default, paper: themePalette.background.light.paper },
            text: { primary: themePalette.text.light.primary, secondary: themePalette.text.light.secondary },
        },
    },
    logistica_dark: {
        id: 'logistica_dark',
        label: 'Midnight Blue',
        mode: 'dark',
        shapeBorderRadius: 4,
        palette: {
            divider: '#2a2f3e',
            primary: { main: '#1976d2', contrastText: '#ffffff' },
            secondary: { main: '#ffa726', contrastText: '#000000' },
            error: { main: themePalette.error.main },
            warning: { main: themePalette.warning.main },
            success: { main: themePalette.success.main },
            background: { default: themePalette.background.dark.default, paper: themePalette.background.dark.paper },
            text: { primary: themePalette.text.dark.primary, secondary: themePalette.text.dark.secondary },
        },
    },
    midnight_tech: {
        id: 'midnight_tech',
        label: 'Midnight Tech',
        mode: 'dark',
        shapeBorderRadius: 8,
        palette: {
            divider: '#494454',
            primary: { main: '#d0bcff', contrastText: '#3c0091' },
            secondary: { main: '#4cd7f6', contrastText: '#003640' },
            error: { main: '#ffb4ab' },
            warning: { main: '#03b5d3' },
            success: { main: '#4cd7f6' },
            background: { default: '#131316', paper: '#1f1f22' },
            text: { primary: '#e4e1e6', secondary: '#cbc3d7' },
        },
    },
    nordic_ice: {
        id: 'nordic_ice',
        label: 'Nordic Ice',
        mode: 'light',
        shapeBorderRadius: 8,
        palette: {
            divider: '#c1c6d7',
            primary: { main: '#0058bc', contrastText: '#ffffff' },
            secondary: { main: '#595f64', contrastText: '#ffffff' },
            error: { main: '#ba1a1a' },
            warning: { main: '#0070eb' },
            success: { main: '#005bc1' },
            background: { default: '#f8f9ff', paper: '#ffffff' },
            text: { primary: '#0b1c30', secondary: '#414755' },
        },
    },
    sunset_express: {
        id: 'sunset_express',
        label: 'Sunset Express',
        mode: 'light',
        shapeBorderRadius: 12,
        palette: {
            divider: '#e1bfb2',
            primary: { main: '#9e3d00', contrastText: '#ffffff' },
            secondary: { main: '#b22a27', contrastText: '#ffffff' },
            error: { main: '#ba1a1a' },
            warning: { main: '#c64f00' },
            success: { main: '#6e5656' },
            background: { default: '#fcf9f4', paper: '#ffffff' },
            text: { primary: '#1c1c19', secondary: '#594137' },
        },
    },
};

export const orderedAppThemeIds: AppThemeId[] = [
    'logistica_light',
    'logistica_dark',
    'midnight_tech',
    'nordic_ice',
    'sunset_express',
];

export function getThemePreviewSwatches(theme: AppThemePreset): ThemePreviewSwatch[] {
    return [
        { color: theme.palette.background.default, label: 'Fondo' },
        { color: theme.palette.background.paper, label: 'Superficie' },
        { color: theme.palette.primary.main, label: 'Primario' },
        { color: theme.palette.secondary.main, label: 'Secundario' },
        { color: theme.palette.success.main, label: 'Acento' },
    ];
}
