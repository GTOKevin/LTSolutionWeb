import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from '@widgets/header/ui/Header';
import { Sidebar } from '@widgets/sidebar/ui/Sidebar';

export function AppLayout() {
    return (
        <Box sx={{ display: 'flex' }}>
            <Header />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: (theme) => theme.palette.background.default,
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
