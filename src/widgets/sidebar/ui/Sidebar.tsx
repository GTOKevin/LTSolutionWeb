import {
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Collapse,
    Avatar,
    IconButton,
    useTheme,
    alpha,
    Menu,
    MenuItem as MuiMenuItem,
    Divider,
    Backdrop,
    CircularProgress
} from '@mui/material';
import {
    ExpandLess,
    ExpandMore,
    MoreVert as MoreVertIcon,
    AccountCircle,
    Key,
    Logout,
    LocalShipping as TruckIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutStore } from '@shared/store/layout.store';
import { useAuthStore } from '@shared/store/auth.store';
import { useState, useMemo, useEffect, useRef, type MouseEvent } from 'react';
import { hasPermission as hasUserPermission } from '@shared/lib/permissions/hasPermission';
import { SelfChangePasswordModal } from '@features/auth/change-password/ui/SelfChangePasswordModal';
import { APP_PATHS } from '@app/router/model/navigation';

export const DRAWER_WIDTH = 280;

export interface SidebarMenuItem {
    text: string;
    path?: string;
    icon: React.ReactNode;
    children?: SidebarMenuItem[];
    permission?: string | string[];
    section?: string;
}

interface SidebarProps {
    menu: SidebarMenuItem[];
}

export function Sidebar({ menu }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarOpen, setSidebarOpen } = useLayoutStore();
    const { user, logout } = useAuthStore();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<{ path: string; label: string } | null>(null);
    const openMenu = Boolean(anchorEl);
    const userInitials = useMemo(() => {
        const baseValue = user?.name || user?.email || 'Usuario';
        const initials = baseValue
            .split(/[\s.@_-]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('');

        return initials || 'U';
    }, [user?.email, user?.name]);

    const navigationTimeoutRef = useRef<number | null>(null);
    const isNavigating = pendingNavigation !== null && location.pathname !== pendingNavigation.path;
    const navigationLabel = pendingNavigation?.label ?? '';

    // Filter menu items based on permissions
    const filteredMenu = useMemo(() => {
        return menu.reduce<SidebarMenuItem[]>((acc, item) => {
            // Check if parent has permission
            if (!hasUserPermission(user, item.permission)) return acc;

            // If it has children, filter them too
            if (item.children) {
                const filteredChildren = item.children.filter(child => 
                    hasUserPermission(user, child.permission)
                );
                
                // If after filtering children none remain, and it was a category (no path), skip it
                if (filteredChildren.length === 0 && !item.path) {
                    return acc;
                }
                
                // Return item with filtered children
                acc.push({
                    ...item,
                    children: filteredChildren
                });
            } else {
                // No children, just add if permission passed
                acc.push(item);
            }
            return acc;
        }, []);
    }, [menu, user]);

    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
        const initialOpen: Record<string, boolean> = {};
        filteredMenu.forEach(item => {
            if (item.children) {
                // Check if any child matches current path
                const isActive = item.children.some(child => 
                    location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
                );
                if (isActive) {
                    initialOpen[item.text] = true;
                }
            }
        });
        return initialOpen;
    });

    const handleSubmenuClick = (text: string) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [text]: !prev[text]
        }));
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (navigationTimeoutRef.current) {
                clearTimeout(navigationTimeoutRef.current);
            }
        };
    }, []);

    const handleNavigation = (path: string, label: string) => {
        if (isNavigating) return;
        if (location.pathname === path) return;
        
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }

        setPendingNavigation({ path, label });
        navigate(path);
        
        navigationTimeoutRef.current = window.setTimeout(() => {
            setPendingNavigation(null);
        }, 4000);
    };

    const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleGoToMyProfile = () => {
        handleMenuClose();
        navigate(APP_PATHS.profile);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate(APP_PATHS.login);
    };

    const handleOpenChangePassword = () => {
        handleMenuClose();
        setChangePasswordOpen(true);
    };

    const isPathActive = (path?: string) => {
        if (!path) return false;
        if (location.pathname === path) return true;
        return location.pathname.startsWith(`${path}/`);
    };

    const renderMenuItem = (item: SidebarMenuItem) => (
        <Box key={item.text}>
            {item.section && (
                <Box sx={{ px: 3, py: 2 }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: '#5a6b7c', 
                            fontWeight: 600, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em' 
                        }}
                    >
                        {item.section}
                    </Typography>
                </Box>
            )}
            {/* Parent Menu Item */}
            {item.children ? (
                <ListItemButton 
                    onClick={() => handleSubmenuClick(item.text)}
                    disabled={isNavigating}
                    sx={{ 
                        borderRadius: 2,
                        mb: 0.5,
                        mx: 1.5,
                        color: openSubmenus[item.text] ? 'primary.main' : 'text.secondary',
                        bgcolor: openSubmenus[item.text] ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            color: 'primary.main'
                        }
                    }}
                >
                    <ListItemIcon sx={{ 
                        minWidth: 40,
                        color: 'inherit'
                    }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                            fontWeight: openSubmenus[item.text] ? 600 : 500,
                            fontSize: '0.95rem'
                        }}
                    />
                    {openSubmenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
            ) : (
                <ListItemButton 
                    onClick={() => item.path && handleNavigation(item.path, item.text)}
                    selected={isPathActive(item.path)}
                    disabled={isNavigating}
                    sx={{ 
                        borderRadius: 2,
                        mb: 0.5,
                        mx: 1.5,
                        color: isPathActive(item.path) ? 'primary.main' : 'text.secondary',
                        bgcolor: isPathActive(item.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.16),
                            }
                        },
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            color: 'primary.main'
                        }
                    }}
                >
                    <ListItemIcon sx={{ 
                        minWidth: 40,
                        color: 'inherit'
                    }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                            fontWeight: isPathActive(item.path) ? 600 : 500,
                            fontSize: '0.95rem'
                        }}
                    />
                </ListItemButton>
            )}

            {/* Submenu Children */}
            {item.children && (
                <Collapse in={openSubmenus[item.text]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.children.map((child: SidebarMenuItem) => (
                            <ListItemButton 
                                key={child.text}
                                onClick={() => child.path && handleNavigation(child.path, child.text)}
                                selected={isPathActive(child.path)}
                                disabled={isNavigating}
                                sx={{ 
                                    pl: 4, 
                                    borderRadius: 2,
                                    mb: 0.5,
                                    mx: 1.5,
                                    color: isPathActive(child.path) ? 'primary.main' : 'text.secondary',
                                    bgcolor: isPathActive(child.path) ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    '&.Mui-selected': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                    },
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    minWidth: 36,
                                    color: 'inherit',
                                    mr: 1 
                                }}>
                                    {child.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={child.text} 
                                    primaryTypographyProps={{ 
                                        fontWeight: isPathActive(child.path) ? 600 : 400,
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    );

    const drawerContent = (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#ffffff', // From design: bg-surface-dark or white
            color: theme.palette.text.primary
        }}>
            {/* Logo Area */}
            <Box sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5
            }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                }}>
                    <TruckIcon />
                </Box>
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
                        LogisticsApp
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        Admin Console
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Links */}
            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                py: 1,
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-thumb': { 
                    backgroundColor: '#3b4754', 
                    borderRadius: 4 
                }
            }}>
                <List component="nav" disablePadding>
                    {filteredMenu.map(renderMenuItem)}
                </List>
            </Box>

            {/* User Profile (Bottom) */}
            <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#283039' : theme.palette.divider}`,
            }}>
                <Box 
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.common.white, 0.05)
                        }
                    }}
                    onClick={handleMenuClick}
                >
                    <Avatar
                        sx={{ width: 36, height: 36, bgcolor: 'grey.700' }}
                    >
                        {userInitials}
                    </Avatar>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                            {user?.name || ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {user?.email || ''}
                        </Typography>
                    </Box>
                    <IconButton 
                        size="small" 
                        sx={{ color: '#9dabb9' }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent double triggering if parent has handler
                            handleMenuClick(e);
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: {
                            mt: -1,
                            minWidth: 200,
                            boxShadow: theme.shadows[3],
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.paper
                        }
                    }}
                >
                    <MuiMenuItem onClick={handleGoToMyProfile}>
                        <ListItemIcon>
                            <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Mi Perfil</ListItemText>
                    </MuiMenuItem>
                    <MuiMenuItem onClick={handleOpenChangePassword}>
                        <ListItemIcon>
                            <Key fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Cambiar contraseña</ListItemText>
                    </MuiMenuItem>
                    <Divider />
                    <MuiMenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                        <ListItemIcon>
                            <Logout fontSize="small" sx={{ color: theme.palette.error.main }} />
                        </ListItemIcon>
                        <ListItemText>Cerrar sesión</ListItemText>
                    </MuiMenuItem>
                </Menu>
            </Box>
            <Backdrop
                open={isNavigating}
                sx={{
                    color: '#fff',
                    zIndex: (currentTheme) => currentTheme.zIndex.drawer + 10,
                    flexDirection: 'column',
                    gap: 1.5
                }}
            >
                <CircularProgress color="inherit" />
                <Typography variant="subtitle1" fontWeight={700}>
                    Ingresando a {navigationLabel || 'la vista'}...
                </Typography>
            </Backdrop>
            <SelfChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
                usuarioNombre={user?.name ?? undefined}
                onSuccess={() => setChangePasswordOpen(false)}
            />
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: DRAWER_WIDTH,
                        borderRight: 'none'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: DRAWER_WIDTH,
                        borderRight: `1px solid ${theme.palette.mode === 'dark' ? '#283039' : theme.palette.divider}`,
                        backgroundColor: 'transparent'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
}
