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
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#f6f7f8'
                }}
            >
                <Toolbar sx={{ height: 64, flexShrink: 0 }} />
                <Box sx={{ 
                    flex: 1, 
                    minHeight: 0, 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto', // Changed from hidden to auto to allow global scroll if content overflows here
                    pb: { xs: 7, md: 0 } // Move bottom padding here for mobile nav
                }}>
                    <Outlet />
                </Box>
            </Box>
            <BottomNav />
        </Box>
    );
}
