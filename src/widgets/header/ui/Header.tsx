import {
    AppBar,
    IconButton,
    Toolbar,
    Box,
    InputBase,
    Badge,
    Typography,
    useTheme,
    alpha
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    ChevronRight as ChevronRightIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useThemeStore } from '@shared/store/theme.store';
import { DRAWER_WIDTH } from '@widgets/sidebar/ui/Sidebar';
import { useLocation, } from 'react-router-dom';

export function Header() {
    const { mode, toggleMode } = useThemeStore();
    const theme = useTheme();
    const location = useLocation();


    // Map routes to titles
    const getTitle = () => {
        if (location.pathname.startsWith('/app/clientes')) return 'Gestión de Clientes';
        if (location.pathname.startsWith('/app/cotizaciones')) return 'Gestión de Cotizaciones';
        if (location.pathname.startsWith('/app/facturas')) return 'Gestión de Facturas';
        if (location.pathname.startsWith('/app/flota')) return 'Gestión de Flota';
        if (location.pathname.startsWith('/app/mercaderia')) return 'Catálogo de Mercadería';
        if (location.pathname.startsWith('/app/colaboradores')) return 'Gestión de Colaboradores';
        if (location.pathname.startsWith('/app/gastos')) return 'Gestión de Gastos';
        if (location.pathname.startsWith('/app/usuarios')) return 'Gestión de Usuarios';
        if (location.pathname.startsWith('/app/maestros')) return 'Maestros';
        if (location.pathname.startsWith('/app/reportes')) return 'Reportes';
        return 'Dashboard';
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                ml: { md: `${DRAWER_WIDTH}px` },
                bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#ffffff', // From design
                borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#283039' : theme.palette.divider}`,
                color: theme.palette.text.primary
            }}
        >
            <Toolbar sx={{ height: 64, px: { xs: 2, md: 3 } }}>
                {/* Mobile Title */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.125rem' }}>
                        {getTitle()}
                    </Typography>
                </Box>

                {/* Desktop Breadcrumbs */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.primary.main } }}
                    >
                        Inicio
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.primary.main } }}
                    >
                        Administración
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500}>
                        {getTitle()}
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Right Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                    {/* Mobile Add Button */}
                    {location.pathname === '/app/clientes' && (
                        <IconButton 
                            sx={{ 
                                display: { xs: 'flex', md: 'none' }, 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                            }}
                            // Trigger event for adding client. 
                            // Since we can't easily pass props to page, we'll rely on the page listening 
                            // or use a custom event. For now, we'll dispatch a custom event.
                            onClick={() => window.dispatchEvent(new CustomEvent('open-create-client-modal'))}
                        >
                            <AddIcon />
                        </IconButton>
                    )}

                    {/* Search Bar (Hidden on Mobile) */}
                    <Box
                        sx={{
                            position: 'relative',
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? '#1c2127' : '#f6f7f8',
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.mode === 'dark' ? '#3b4754' : theme.palette.divider}`,
                            width: 280,
                            height: 36,
                            px: 1.5,
                            '&:focus-within': {
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 0 0 1px ${theme.palette.primary.main}`
                            }
                        }}
                    >
                        <SearchIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                        <InputBase
                            placeholder="Buscar en la plataforma..."
                            sx={{ flex: 1, fontSize: '0.875rem' }}
                        />
                        <Box
                            component="span"
                            sx={{
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 0.5,
                                px: 0.5,
                                py: 0.25,
                                lineHeight: 1
                            }}
                        >
                            ⌘K
                        </Box>
                    </Box>

                    {/* Divider */}
                    <Box 
                        sx={{ 
                            height: 24, 
                            width: '1px', 
                            bgcolor: theme.palette.divider,
                            mx: 0.5,
                            display: { xs: 'none', md: 'block' }
                        }} 
                    />

                    {/* Notifications */}
                    <IconButton
                        size="small"
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                        }}
                    >
                        <Badge 
                            variant="dot" 
                            color="error"
                            sx={{ '& .MuiBadge-badge': { top: 4, right: 4, border: `2px solid ${theme.palette.background.paper}` } }}
                        >
                            <NotificationsIcon sx={{ fontSize: 22 }} />
                        </Badge>
                    </IconButton>

                    {/* Theme Toggle */}
                    <IconButton
                        onClick={toggleMode}
                        size="small"
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
                        }}
                    >
                        {mode === 'dark' ? (
                            <LightModeIcon sx={{ fontSize: 22 }} />
                        ) : (
                            <DarkModeIcon sx={{ fontSize: 22 }} />
                        )}
                    </IconButton>
                    
                    {/* Mobile Menu Toggle (Moved to right or kept left? Reference doesn't show it in header)
                        If we follow reference strictly, there is no hamburger. But we need navigation.
                        We will keep hamburger but maybe on the right or left. 
                        Let's keep it left for standard UX unless we do bottom nav.
                    */}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
