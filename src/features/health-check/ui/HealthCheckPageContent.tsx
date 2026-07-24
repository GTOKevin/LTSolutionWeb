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
import type { useHealthCheckPageController } from '../hooks/useHealthCheckPageController';

interface HealthCheckPageContentProps {
    controller: ReturnType<typeof useHealthCheckPageController>;
}

export function HealthCheckPageContent({ controller }: HealthCheckPageContentProps) {
    const {
        themeId,
        setThemeId,
        themeAnchorEl,
        setThemeAnchorEl,
        themeMenuOpen,
        themeOptions,
        apiStatus,
        apiMessage,
        checkApiConnection,
        isDev,
    } = controller;

    return (
        <Container maxWidth="md">
            <Box sx={{ py: 8 }}>
                <Stack spacing={4}>
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
                            {themeOptions.map((themeOption) => (
                                <MenuItem
                                    key={themeOption.id}
                                    selected={themeOption.id === themeId}
                                    onClick={() => {
                                        setThemeId(themeOption.id);
                                        setThemeAnchorEl(null);
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 34 }}>
                                        {themeOption.id === themeId ? <CheckIcon fontSize="small" /> : null}
                                    </ListItemIcon>
                                    <ListItemText>{themeOption.label}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Stack>

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
                                        {isDev ? 'Desarrollo' : 'Producción'}
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
                                    {apiStatus === 'checking' ? (
                                        <Typography variant="body1">Verificando conexión...</Typography>
                                    ) : null}
                                    {apiStatus === 'connected' ? (
                                        <>
                                            <CheckCircleIcon color="success" />
                                            <Typography variant="body1" color="success.main">
                                                Conectado
                                            </Typography>
                                        </>
                                    ) : null}
                                    {apiStatus === 'error' ? (
                                        <>
                                            <ErrorIcon color="error" />
                                            <Typography variant="body1" color="error.main">
                                                Error de conexión
                                            </Typography>
                                        </>
                                    ) : null}
                                </Stack>

                                {apiMessage ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {apiMessage}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </CardContent>
                    </Card>

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
