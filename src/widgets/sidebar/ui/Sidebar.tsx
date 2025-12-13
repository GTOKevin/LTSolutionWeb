import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from '@mui/material';
import {
    People as PeopleIcon,
    Description as DescriptionIcon,
    LocalShipping as TruckIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLayoutStore } from '@shared/store/layout.store';

const DRAWER_WIDTH = 240;

interface MenuItem {
    text: string;
    path: string;
    icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
    { text: 'Clientes', path: '/app/clientes', icon: <PeopleIcon /> },
    { text: 'Cotizaciones', path: '/app/cotizaciones', icon: <DescriptionIcon /> },
    { text: 'Facturas', path: '/app/facturas', icon: <ReceiptIcon /> },
    { text: 'Flota', path: '/app/flota', icon: <TruckIcon /> },
];

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sidebarOpen, setSidebarOpen } = useLayoutStore();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const drawer = (
        <>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => handleNavigation(item.path)}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </>
    );

    return (
        <>
            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: sidebarOpen ? 'block' : 'none' },
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
}
