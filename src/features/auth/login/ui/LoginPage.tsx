import { Box, useTheme } from '@mui/material';
import { LoginForm } from './LoginForm';
import { LoginMarketingPanel } from './LoginMarketingPanel';

export function LoginPage() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'row',
                overflow: 'hidden',
                backgroundColor: isDark ? 'background.default' : '#ffffff',
                color: 'text.primary',
                fontFamily: '"Spline Sans", "Inter", sans-serif',
            }}
        >
            {/* Left Column: Form & Utilities (45% on desktop) */}
            <Box
                component="main"
                sx={{
                    position: 'relative',
                    width: { xs: '100%', lg: '45%' },
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { xs: 3, sm: 6, lg: 6, xl: 8 },
                    zIndex: 10,
                    backgroundColor: isDark ? 'background.paper' : '#ffffff',
                    borderRight: 1,
                    borderColor: isDark ? 'divider' : 'rgba(226, 232, 240, 0.8)',
                    boxShadow: { xs: 'none', lg: '4px 0 24px -2px rgba(15, 23, 42, 0.05)' },
                }}
            >
                <LoginForm />
            </Box>

            {/* Right Column: Portal Dashboard Preview (55% on desktop) */}
            <LoginMarketingPanel />
        </Box>
    );
}
