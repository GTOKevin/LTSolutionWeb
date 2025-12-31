import {
    Box,
    Drawer,
    List,
    ListItem,
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
    MenuItem,
    Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    LocalShipping as TruckIcon,
    DirectionsCar as CarIcon,
    Groups as GroupsIcon,
    Settings as SettingsIcon,
    Description as ReportIcon,
    ExpandLess,
    ExpandMore,
    MoreVert as MoreVertIcon,
    Inventory as InventoryIcon,
    MonetizationOn as MonetizationOnIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Category as CategoryIcon,
    Business as BusinessIcon,
    Receipt as ReceiptIcon,
    Build as BuildIcon,
    AccountCircle,
    Key,
    Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutStore } from '@shared/store/layout.store';
import { useAuthStore } from '@shared/store/auth.store';
import { useState } from 'react';

export const DRAWER_WIDTH = 280;

interface MenuItem {
    text: string;
    path?: string;
    icon: React.ReactNode;
    children?: MenuItem[];
    section?: string;
}

const menuItems: MenuItem[] = [
    { text: 'Dashboard', path: '/app', icon: <DashboardIcon /> },
    {
        text: 'Gestión Comercial',
        icon: <BusinessIcon />,
        children: [
            { text: 'Clientes', path: '/app/clientes', icon: <GroupsIcon /> },
            { text: 'Cotizaciones', path: '/app/cotizaciones', icon: <ReportIcon /> }, 
            { text: 'Facturas', path: '/app/facturas', icon: <ReceiptIcon /> },
        ]
    },
    {
        text: 'Operaciones',
        icon: <TruckIcon />,
        children: [
             { text: 'Flota', path: '/app/flota', icon: <CarIcon /> },
             { text: 'Mantenimientos', path: '/app/mantenimientos', icon: <BuildIcon /> },
             { text: 'Mercadería', path: '/app/mercaderia', icon: <InventoryIcon /> },
             { text: 'Colaboradores', path: '/app/colaboradores', icon: <GroupsIcon /> },
             { text: 'Gastos', path: '/app/gastos', icon: <MonetizationOnIcon /> },
        ]
    },
    {
        text: 'Configuración',
        icon: <SettingsIcon />,
        section: 'Administración',
        children: [
            { text: 'Usuarios', path: '/app/usuarios', icon: <PersonIcon /> },
            { text: 'Roles Usuario', path: '/app/roles-usuario', icon: <SecurityIcon /> },
            { text: 'Roles Colaborador', path: '/app/roles-colaborador', icon: <SecurityIcon /> },
            { text: 'Maestros', path: '/app/maestros', icon: <CategoryIcon /> },
        ]
    },
    { text: 'Reportes', path: '/app/reportes', icon: <ReportIcon /> }
];

// Helper icon for mapping
function DescriptionIcon(props: any) {
    return <ReportIcon {...props} />;
}


export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarOpen, setSidebarOpen } = useLayoutStore();
    const { user, logout } = useAuthStore();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };
    
    // Calculate initial open state based on current location
    const getInitialOpenState = () => {
        const state: Record<string, boolean> = {};
        menuItems.forEach(item => {
            if (item.children) {
                // Check if any child matches the current path
                const hasActiveChild = item.children.some(child => 
                    child.path && (location.pathname === child.path || location.pathname.startsWith(`${child.path}/`))
                );
                if (hasActiveChild) {
                    state[item.text] = true;
                }
            }
        });
        return state;
    };
    
    const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(getInitialOpenState);

    const handleSubmenuClick = (text: string) => {
        setOpenSubmenus(prev => ({ ...prev, [text]: !prev[text] }));
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        if (window.innerWidth < 900) {
             setSidebarOpen(false);
        }
    };

    const renderMenuItem = (item: MenuItem, depth = 0) => {
        // Improved active state logic: exact match or starts with path (for nested routes)
        const isSelected = item.path 
            ? (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
            : false;
            
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openSubmenus[item.text];

        // Custom colors from design
        const inactiveColor = '#475569';
        const activeColor = theme.palette.primary.main;
        const hoverBg = alpha(theme.palette.common.white, 0.05);
        const selectedBg = alpha(theme.palette.primary.main, 0.12); // Slightly stronger background

        if (hasChildren) {
            return (
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
                    <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => handleSubmenuClick(item.text)}
                            sx={{
                                minHeight: 44,
                                mx: 1.5,
                                borderRadius: 2,
                                justifyContent: 'initial',
                                px: 2,
                                color: isOpen ? theme.palette.text.primary : inactiveColor,
                                '&:hover': {
                                    backgroundColor: hoverBg,
                                    color: theme.palette.text.primary,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: 1.5,
                                    justifyContent: 'center',
                                    color: 'inherit'
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} 
                            />
                            {isOpen ? <ExpandLess sx={{ fontSize: 20 }} /> : <ExpandMore sx={{ fontSize: 20 }} />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children?.map(child => renderMenuItem(child, depth + 1))}
                        </List>
                    </Collapse>
                </Box>
            );
        }

        return (
            <ListItem key={item.path || item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                    selected={isSelected}
                    onClick={() => item.path && handleNavigation(item.path)}
                    sx={{
                        minHeight: 44,
                        mx: 1.5,
                        borderRadius: 2,
                        justifyContent: 'initial',
                        px: 2,
                        color: isSelected ? activeColor : inactiveColor,
                        backgroundColor: isSelected ? selectedBg : 'transparent',
                        borderLeft: isSelected ? `3px solid ${activeColor}` : '3px solid transparent', // Add border indicator
                        '&:hover': {
                            backgroundColor: isSelected ? alpha(activeColor, 0.2) : hoverBg,
                            color: theme.palette.text.primary,
                            '& .MuiListItemIcon-root': {
                                color: isSelected ? activeColor : theme.palette.text.primary
                            }
                        },
                        '&.Mui-selected': {
                             backgroundColor: selectedBg,
                             color: activeColor,
                             '&:hover': {
                                 backgroundColor: alpha(activeColor, 0.2),
                             }
                        }
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: 1.5,
                            justifyContent: 'center',
                            color: isSelected ? activeColor : 'inherit',
                            transition: 'color 0.2s'
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                            fontSize: '0.875rem', 
                            fontWeight: isSelected ? 700 : 500 
                        }} 
                    />
                </ListItemButton>
            </ListItem>
        );
    };

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
                items: 'center', 
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
                <List>
                    {menuItems.map(item => renderMenuItem(item))}
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
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6OVG_QZtlE27G6Ja4RO2KTtjk-cMNFBU4D-nCgCI2P5rDs41_GnpE4glBK-PzV8_JQxw7dJi8H-p6dFGowQbPHpEm1F5emW5xVf-ZatYDiTIBmx0LQrPeNHITnQkKVFf0Jn8gjffXI2w6vGVGS6qfjGqgOBM55MHEtFSfAAV_Bd7r83UdcZIf-5jObmp_LxZZngSJpfNsL3_YDBAVNR0f88m9xoNnUEG6drlpHhVieNC54MCkTQACOpJIPxu-bcfNtcHg7vc0uV0"
                        sx={{ width: 36, height: 36, bgcolor: 'grey.700' }}
                    >
                        {user?.name?.[0] || 'U'}
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
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Mi Perfil</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <Key fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Cambiar contraseña</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                        <ListItemIcon>
                            <Logout fontSize="small" sx={{ color: theme.palette.error.main }} />
                        </ListItemIcon>
                        <ListItemText>Cerrar sesión</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
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
