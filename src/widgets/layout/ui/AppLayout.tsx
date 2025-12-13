import { Box, Toolbar, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from '@widgets/header/ui/Header';
import { Sidebar, DRAWER_WIDTH } from '@widgets/sidebar/ui/Sidebar';

export function AppLayout() {
    const theme = useTheme();
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#f6f7f8' }}>
            <Header />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar sx={{ height: 64 }} /> {/* Spacer for fixed header */}
                <Outlet />
            </Box>
        </Box>
    );
}
