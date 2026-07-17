import {
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    useTheme
} from '@mui/material';

export interface BottomNavItem {
    label: string;
    icon: React.ReactNode;
    path?: string;
    onClick?: () => void;
}

interface BottomNavProps {
    items: BottomNavItem[];
    value: number;
    onChange: (item: BottomNavItem) => void;
}

export function BottomNav({ items, value, onChange }: BottomNavProps) {
    const theme = useTheme();

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
                value={value}
                onChange={(_, newValue) => {
                    const selectedItem = items[newValue];

                    if (!selectedItem) {
                        return;
                    }

                    onChange(selectedItem);
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
                {items.map((item) => (
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
