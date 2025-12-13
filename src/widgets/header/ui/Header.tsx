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
    Menu as MenuIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useLayoutStore } from '@shared/store/layout.store';
import { useThemeStore } from '@shared/store/theme.store';
import { DRAWER_WIDTH } from '@widgets/sidebar/ui/Sidebar';

export function Header() {
    const { toggleSidebar } = useLayoutStore();
    const { mode, toggleMode } = useThemeStore();
    const theme = useTheme();

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
            <Toolbar sx={{ height: 64, px: 3 }}>
                {/* Mobile Menu Button */}
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={toggleSidebar}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Breadcrumbs (Hidden on Mobile) */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
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
                        Maestros
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Right Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            mx: 0.5 
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
                </Box>
            </Toolbar>
        </AppBar>
    );
}
