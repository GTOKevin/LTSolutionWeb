import {
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    useTheme
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Groups as GroupsIcon,
    LocalShipping as TruckIcon,
    Description as DescriptionIcon,
    Menu as MenuIcon,
    Payments as PaymentsIcon,
    EventNote as EventNoteIcon,
    Badge as BadgeIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutStore } from '@shared/store/layout.store';
import { useAuthStore } from '@shared/store/auth.store';
import { PERMISSIONS } from '@shared/constants/permissions';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    path?: string;
    onClick?: () => void;
}

export function BottomNav() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleSidebar } = useLayoutStore();
    const user = useAuthStore((state) => state.user);

    const hasPermission = (requiredPermission?: string | string[]) => {
        if (!requiredPermission) {
            return true;
        }

        if (!user?.permissions) {
            return false;
        }

        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some((permission) => user.permissions.includes(permission));
        }

        return user.permissions.includes(requiredPermission);
    };

    const isPortalRoute = location.pathname.startsWith('/app/mis-') || location.pathname.startsWith('/app/perfil');

    const portalItems: NavItem[] = [
        {
            label: 'Viajes',
            icon: <TruckIcon />,
            path: '/app/mis-viajes',
        },
        {
            label: 'Pagos',
            icon: <PaymentsIcon />,
            path: '/app/mis-pagos',
        },
        {
            label: 'Licencias',
            icon: <EventNoteIcon />,
            path: '/app/mis-licencias',
        },
        {
            label: 'Documentos',
            icon: <BadgeIcon />,
            path: '/app/mis-documentos',
        },
        {
            label: 'Perfil',
            icon: <PersonIcon />,
            path: '/app/perfil',
        },
    ].filter((item) => {
        switch (item.path) {
            case '/app/mis-viajes':
                return hasPermission([PERMISSIONS.EMPLOYEE.VIAJES.VER, PERMISSIONS.EMPLOYEE.VIAJES.GESTIONAR]);
            case '/app/mis-pagos':
                return hasPermission([PERMISSIONS.EMPLOYEE.PAGOS.VER, PERMISSIONS.EMPLOYEE.PAGOS.CONFIRMAR]);
            case '/app/mis-licencias':
                return hasPermission([PERMISSIONS.EMPLOYEE.LICENCIAS.VER, PERMISSIONS.EMPLOYEE.LICENCIAS.SOLICITAR]);
            case '/app/mis-documentos':
                return hasPermission([
                    PERMISSIONS.EMPLOYEE.DOCUMENTOS.VER,
                    PERMISSIONS.EMPLOYEE.DOCUMENTOS.SOLICITAR_ACTUALIZACION,
                ]);
            default:
                return true;
        }
    });

    const adminItems: NavItem[] = [
        {
            label: 'Inicio',
            icon: <DashboardIcon />,
            path: '/app/dashboard',
        },
        {
            label: 'Clientes',
            icon: <GroupsIcon />,
            path: '/app/clientes',
        },
        {
            label: 'Pedidos',
            icon: <DescriptionIcon />,
            path: '/app/cotizaciones',
        },
        {
            label: 'Flota',
            icon: <TruckIcon />,
            path: '/app/flota',
        },
        {
            label: 'Menú',
            icon: <MenuIcon />,
            onClick: toggleSidebar,
        },
    ].filter((item) => {
        switch (item.path) {
            case '/app/dashboard':
                return hasPermission(PERMISSIONS.DASHBOARD.VER);
            case '/app/clientes':
                return hasPermission(PERMISSIONS.CLIENTES.VER);
            case '/app/cotizaciones':
                return hasPermission(PERMISSIONS.COTIZACIONES.VER);
            case '/app/flota':
                return hasPermission(PERMISSIONS.FLOTA.VER);
            default:
                return true;
        }
    });

    const navItems = isPortalRoute && portalItems.length > 0 ? portalItems : adminItems;

    // Determine value based on path
    const getValue = () => {
        return navItems.findIndex((item) => item.path && location.pathname.startsWith(item.path));
    };

    return (
        <Paper 
            sx={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                display: { md: 'none' },
                zIndex: 1200,
                borderTop: `1px solid ${theme.palette.divider}`,
                pb: 'env(safe-area-inset-bottom)'
            }} 
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={getValue()}
                onChange={(_, newValue) => {
                    const selectedItem = navItems[newValue];

                    if (!selectedItem) {
                        return;
                    }

                    if (selectedItem.path) {
                        navigate(selectedItem.path);
                        return;
                    }

                    if (selectedItem.onClick) {
                        selectedItem.onClick();
                    }
                }}
                sx={{
                    bgcolor: theme.palette.mode === 'dark' ? '#1a242d' : '#ffffff', // bg-surface
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        color: theme.palette.text.secondary,
                        minWidth: 'auto',
                        padding: '6px 0 8px',
                        '&.Mui-selected': {
                            color: theme.palette.primary.main,
                        }
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        mt: 0.5,
                        '&.Mui-selected': {
                            fontSize: '0.65rem', // Prevent jump
                        }
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: 24,
                        mb: 0.5
                    }
                }}
            >
                {navItems.map((item) => (
                    <BottomNavigationAction
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
}
