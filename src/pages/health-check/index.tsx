import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
    PaletteOutlined as PaletteIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { httpClient } from '../../shared/api/http';
import { env } from '../../shared/config/env';
import { useThemeStore } from '../../shared/store/theme.store';
import { appThemePresets } from '@/shared/config/theme/palette';

function getHealthCheckErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'detail' in error && typeof error.detail === 'string') {
        return error.detail;
    }

    return 'No se pudo verificar el estado del backend.';
}

export function HealthCheckPage() {
    const { themeId, setThemeId } = useThemeStore();
    const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [apiMessage, setApiMessage] = useState<string>('');
    const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
    const themeMenuOpen = Boolean(themeAnchorEl);

    const checkApiConnection = useCallback(async (resetStatus: boolean = true) => {
        if (resetStatus) {
            setApiStatus('checking');
            setApiMessage('');
        }

        try {
            await httpClient.get('/health');
            setApiStatus('connected');
            setApiMessage('El endpoint de salud del backend responde correctamente.');
        } catch (error: unknown) {
            setApiStatus('error');
            setApiMessage(getHealthCheckErrorMessage(error));
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadInitialHealthStatus = async () => {
            try {
                await httpClient.get('/health');

                if (!isMounted) {
                    return;
                }

                setApiStatus('connected');
                setApiMessage('El endpoint de salud del backend responde correctamente.');
            } catch (error: unknown) {
                if (!isMounted) {
                    return;
                }

                setApiStatus('error');
                setApiMessage(getHealthCheckErrorMessage(error));
            }
        };

        void loadInitialHealthStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 8 }}>
                <Stack spacing={4}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h3" component="h1">
                            Sistema de Logística y Transporte
                        </Typography>
                        <IconButton onClick={(e) => setThemeAnchorEl(e.currentTarget)} color="inherit">
                            <PaletteIcon />
                        </IconButton>
                        <Menu
                            anchorEl={themeAnchorEl}
                            open={themeMenuOpen}
                            onClose={() => setThemeAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            {[
                                appThemePresets.logistica_light,
                                appThemePresets.logistica_dark,
                                appThemePresets.midnight_tech,
                                appThemePresets.nordic_ice,
                                appThemePresets.sunset_express,
                            ].map((t) => (
                                <MenuItem
                                    key={t.id}
                                    selected={t.id === themeId}
                                    onClick={() => {
                                        setThemeId(t.id);
                                        setThemeAnchorEl(null);
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 34 }}>
                                        {t.id === themeId ? <CheckIcon fontSize="small" /> : null}
                                    </ListItemIcon>
                                    <ListItemText>{t.label}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Stack>

                    {/* Sprint 0 Status */}
                    <Card>
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Sprint 0 - Setup Completado
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                El proyecto ha sido inicializado exitosamente con Vite, React, TypeScript y
                                Feature-Sliced Design.
                            </Typography>

                            <Stack spacing={2} sx={{ mt: 3 }}>
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Tecnologías configuradas:
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                                        <Chip label="React 18" size="small" color="primary" />
                                        <Chip label="TypeScript" size="small" color="primary" />
                                        <Chip label="Material-UI" size="small" color="primary" />
                                        <Chip label="React Query" size="small" color="primary" />
                                        <Chip label="Zustand" size="small" color="primary" />
                                        <Chip label="React Router" size="small" color="primary" />
                                        <Chip label="Axios" size="small" color="primary" />
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Arquitectura:
                                    </Typography>
                                    <Chip label="Feature-Sliced Design (FSD)" size="small" variant="outlined" />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Environment Configuration */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Configuración de Entorno
                            </Typography>

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Disponibilidad:
                                    </Typography>
                                    <Typography variant="body1">
                                        Solo visible en desarrollo
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Modo:
                                    </Typography>
                                    <Typography variant="body1">
                                        {env.isDev ? 'Desarrollo' : 'Producción'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Tema:
                                    </Typography>
                                    <Typography variant="body1">
                                        Selector habilitado para pruebas visuales
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* API Connection Status */}
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Estado de Conexión Backend</Typography>
                                <IconButton onClick={() => void checkApiConnection()} size="small">
                                    <RefreshIcon />
                                </IconButton>
                            </Stack>

                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    {apiStatus === 'checking' && (
                                        <>
                                            <Typography variant="body1">Verificando conexión...</Typography>
                                        </>
                                    )}
                                    {apiStatus === 'connected' && (
                                        <>
                                            <CheckCircleIcon color="success" />
                                            <Typography variant="body1" color="success.main">
                                                Conectado
                                            </Typography>
                                        </>
                                    )}
                                    {apiStatus === 'error' && (
                                        <>
                                            <ErrorIcon color="error" />
                                            <Typography variant="body1" color="error.main">
                                                Error de conexión
                                            </Typography>
                                        </>
                                    )}
                                </Stack>

                                {apiMessage && (
                                    <Typography variant="body2" color="text.secondary">
                                        {apiMessage}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Próximos Pasos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sprint 1: Autenticación y Guardias de Ruta
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </Container>
    );
}
