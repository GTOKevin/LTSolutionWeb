import { Box, Toolbar, useTheme } from '@mui/material';
import { Header } from '@widgets/header';
import { Sidebar, DRAWER_WIDTH } from '@widgets/sidebar';
import { BottomNav, type BottomNavItem } from './BottomNav';
import type { AppNavigationItem } from '@app/router/model/navigation';

interface AppLayoutProps {
    title: string;
    sectionTitle: string;
    sidebarMenu: AppNavigationItem[];
    bottomNavItems: BottomNavItem[];
    bottomNavValue: number;
    onBottomNavChange: (item: BottomNavItem) => void;
    headerMobileAction?: {
        icon: React.ReactNode;
        onClick: () => void;
    };
    children: React.ReactNode;
}

export function AppLayout({
    title,
    sectionTitle,
    sidebarMenu,
    bottomNavItems,
    bottomNavValue,
    onBottomNavChange,
    headerMobileAction,
    children,
}: AppLayoutProps) {
    const theme = useTheme();
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.mode === 'dark' ? '#111418' : '#f6f7f8' }}>
            <Header title={title} sectionTitle={sectionTitle} mobileAction={headerMobileAction} />
            <Sidebar menu={sidebarMenu} />
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
                    {children}
                </Box>
            </Box>
            <BottomNav items={bottomNavItems} value={bottomNavValue} onChange={onBottomNavChange} />
        </Box>
    );
}
