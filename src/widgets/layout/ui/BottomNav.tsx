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
    Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutStore } from '@shared/store/layout.store';

export function BottomNav() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { toggleSidebar } = useLayoutStore();

    // Determine value based on path
    const getValue = () => {
        const path = location.pathname;
        if (path === '/app' || path.startsWith('/app/dashboard')) return 0;
        if (path.startsWith('/app/clientes')) return 1;
        if (path.startsWith('/app/cotizaciones')) return 2;
        if (path.startsWith('/app/flota')) return 3;
        return -1; // No selection or Menu
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
                    switch (newValue) {
                        case 0: navigate('/app/dashboard'); break;
                        case 1: navigate('/app/clientes'); break;
                        case 2: navigate('/app/cotizaciones'); break;
                        case 3: navigate('/app/flota'); break;
                        case 4: toggleSidebar(); break; // Menu opens drawer
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
                <BottomNavigationAction label="Inicio" icon={<DashboardIcon />} />
                <BottomNavigationAction label="Clientes" icon={<GroupsIcon />} />
                <BottomNavigationAction label="Pedidos" icon={<DescriptionIcon />} />
                <BottomNavigationAction label="Flota" icon={<TruckIcon />} />
                <BottomNavigationAction label="Menú" icon={<MenuIcon />} />
            </BottomNavigation>
        </Paper>
    );
}
