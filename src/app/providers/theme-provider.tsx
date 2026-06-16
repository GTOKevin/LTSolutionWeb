import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import { useThemeStore } from '../../shared/store/theme.store';
import { appThemePresets } from '../../shared/config/theme/palette';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const themeId = useThemeStore((state) => state.themeId);

    const theme = useMemo(
        () => {
            const preset = appThemePresets[themeId];
            const mode = preset.mode;

            return createTheme({
                palette: {
                    mode,
                    divider: preset.palette.divider,
                    primary: {
                        main: preset.palette.primary.main,
                        contrastText: preset.palette.primary.contrastText,
                    },
                    secondary: {
                        main: preset.palette.secondary.main,
                        contrastText: preset.palette.secondary.contrastText,
                    },
                    warning: {
                        main: preset.palette.warning.main,
                    },
                    error: {
                        main: preset.palette.error.main,
                    },
                    success: {
                        main: preset.palette.success.main,
                    },
                    background: {
                        default: preset.palette.background.default,
                        paper: preset.palette.background.paper,
                    },
                    text: {
                        primary: preset.palette.text.primary,
                        secondary: preset.palette.text.secondary,
                    },
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: {
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        letterSpacing: '-0.01562em',
                    },
                    h2: {
                        fontSize: '2rem',
                        fontWeight: 700,
                        letterSpacing: '-0.00833em',
                    },
                    h3: {
                        fontSize: '1.75rem',
                        fontWeight: 600,
                    },
                    h4: {
                        fontSize: '1.5rem',
                        fontWeight: 600,
                    },
                    h5: {
                        fontSize: '1.25rem',
                        fontWeight: 600,
                    },
                    h6: {
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    },
                    button: {
                        fontWeight: 600,
                        textTransform: 'none',
                    },
                },
                shape: {
                    borderRadius: preset.shapeBorderRadius,
                },
                shadows: [
                    'none',
                    mode === 'light'
                        ? '0px 2px 4px rgba(0,0,0,0.08)'
                        : '0px 2px 4px rgba(0,0,0,0.4)',
                    mode === 'light'
                        ? '0px 4px 8px rgba(0,0,0,0.1)'
                        : '0px 4px 8px rgba(0,0,0,0.5)',
                    mode === 'light'
                        ? '0px 8px 16px rgba(0,0,0,0.12)'
                        : '0px 8px 16px rgba(0,0,0,0.6)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                    mode === 'light'
                        ? '0px 12px 24px rgba(0,0,0,0.14)'
                        : '0px 12px 24px rgba(0,0,0,0.7)'
                ],
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: preset.shapeBorderRadius,
                                padding: '10px 24px',
                                fontSize: '0.9375rem',
                            },
                            contained: {
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                boxShadow:
                                    mode === 'light'
                                        ? '0 2px 8px rgba(0,0,0,0.08)'
                                        : '0 2px 8px rgba(0,0,0,0.4)',
                                border: `1px solid ${preset.palette.divider}`,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'light'
                                    ? '0 2px 8px rgba(0,0,0,0.1)'
                                    : '0 2px 8px rgba(0,0,0,0.5)',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                borderRight: `1px solid ${preset.palette.divider}`,
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: preset.shapeBorderRadius,
                                },
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                            },
                        },
                    },
                },
            });
        },
        [themeId]
    );

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
