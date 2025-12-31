import { Box, Toolbar, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from '@widgets/header/ui/Header';
import { Sidebar, DRAWER_WIDTH } from '@widgets/sidebar/ui/Sidebar';
import { BottomNav } from './BottomNav';
import { SessionExpiredModal } from '@shared/components/ui/SessionExpiredModal';

export function AppLayout() {
    const theme = useTheme();
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#f6f7f8' }}>
            <SessionExpiredModal />
            <Header />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 0, md: 3 }, // Removed padding on mobile to match full width designs often used, or keep small p
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    overflow: 'auto',
                    mb: { xs: 7, md: 0 } // Space for bottom nav
                }}
            >
                <Toolbar sx={{ height: 64 }} /> {/* Spacer for fixed header */}
                <Outlet />
            </Box>
            <BottomNav />
        </Box>
    );
}
