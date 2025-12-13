import {
    AppBar,
    IconButton,
    Toolbar,
    Typography,
    Button,
    Chip,
    Stack,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Logout as LogoutIcon,
    LocalShipping as TruckIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@shared/store/auth.store';
import { useLayoutStore } from '@shared/store/layout.store';
import { useThemeStore } from '@shared/store/theme.store';

export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { toggleSidebar, pageTitle } = useLayoutStore();
    const { mode, toggleMode } = useThemeStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: (theme) =>
                    theme.palette.mode === 'light'
                        ? 'linear-gradient(90deg, #0d47a1 0%, #1565c0 100%)'
                        : 'linear-gradient(90deg, #1a1f2e 0%, #2a2f3e 100%)',
            }}
        >
            <Toolbar>
                <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>

                <TruckIcon sx={{ mr: 1.5, fontSize: 28 }} />

                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                    {pageTitle}
                </Typography>

                {user && (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chip
                            icon={<WarningIcon />}
                            label="Cargas Peligrosas"
                            size="small"
                            color="warning"
                            sx={{
                                fontWeight: 700,
                                display: { xs: 'none', md: 'flex' },
                            }}
                        />

                        <Chip
                            label={user.role}
                            size="small"
                            color="secondary"
                            sx={{
                                textTransform: 'capitalize',
                                fontWeight: 600,
                            }}
                        />

                        <IconButton onClick={toggleMode} color="inherit" size="small">
                            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>

                        <Button
                            color="inherit"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                display: { xs: 'none', sm: 'flex' },
                                fontWeight: 600,
                            }}
                        >
                            Salir
                        </Button>

                        <IconButton
                            onClick={handleLogout}
                            color="inherit"
                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Stack>
                )}
            </Toolbar>
        </AppBar>
    );
}
