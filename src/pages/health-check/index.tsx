import {
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import {
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { httpClient } from '../../shared/api/http';
import { env } from '../../shared/config/env';
import { useThemeStore } from '../../shared/store/theme.store';

export function HealthCheckPage() {
    const { mode, toggleMode } = useThemeStore();
    const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [apiMessage, setApiMessage] = useState<string>('');

    const checkApiConnection = async () => {
        setApiStatus('checking');
        setApiMessage('');

        try {
            // Try to make a simple request to the API
            await httpClient.get('/');
            setApiStatus('connected');
            setApiMessage('API is reachable');
        } catch (error: unknown) {
            setApiStatus('error');
            if (error && typeof error === 'object' && 'detail' in error) {
                setApiMessage((error as { detail: string }).detail || 'Failed to connect to API');
            } else {
                setApiMessage('Failed to connect to API');
            }
        }
    };

    useEffect(() => {
        checkApiConnection();
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
                        <IconButton onClick={toggleMode} color="inherit">
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
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
                                        API URL:
                                    </Typography>
                                    <Typography variant="body1" fontFamily="monospace">
                                        {env.apiUrl}
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
                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                        {mode === 'dark' ? 'Oscuro' : 'Claro'}
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
                                <IconButton onClick={checkApiConnection} size="small">
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
