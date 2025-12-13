import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import { useThemeStore } from '../../shared/store/theme.store';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const mode = useThemeStore((state) => state.mode);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        // Industrial deep blue - professional and trustworthy for logistics
                        main: mode === 'light' ? '#0d47a1' : '#1976d2',
                        light: '#5472d3',
                        dark: '#002171',
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        // Safety orange/amber - for alerts and dangerous goods
                        main: mode === 'light' ? '#ff6f00' : '#ffa726',
                        light: '#ffa040',
                        dark: '#c43e00',
                        contrastText: '#000000',
                    },
                    warning: {
                        // High visibility yellow for warnings
                        main: '#ffd600',
                        light: '#ffff52',
                        dark: '#c7a500',
                    },
                    error: {
                        // Strong red for critical alerts
                        main: '#d32f2f',
                        light: '#ef5350',
                        dark: '#c62828',
                    },
                    success: {
                        // Industrial green for success states
                        main: '#388e3c',
                        light: '#66bb6a',
                        dark: '#2e7d32',
                    },
                    background: {
                        default: mode === 'light' ? '#f0f2f5' : '#0a0e1a',
                        paper: mode === 'light' ? '#ffffff' : '#1a1f2e',
                    },
                    text: {
                        primary: mode === 'light' ? '#1a1a1a' : '#e0e0e0',
                        secondary: mode === 'light' ? '#5f6368' : '#9e9e9e',
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
                    borderRadius: 4,
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
                        : '0px 12px 24px rgba(0,0,0,0.7)',
                ],
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 4,
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
                                border: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #2a2f3e',
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
                                boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.5)',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                borderRight: mode === 'light' ? '1px solid #e0e0e0' : '1px solid #2a2f3e',
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 4,
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
            }),
        [mode]
    );

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
