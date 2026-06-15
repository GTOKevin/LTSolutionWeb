import type { ReactNode } from 'react';
import { alpha, Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { dashboardCardSx } from '../lib/dashboard-styles';

interface DashboardMetricCardProps {
    title: string;
    icon: ReactNode;
    accentColor: string;
    children: ReactNode;
}

export function DashboardMetricCard({ title, icon, accentColor, children }: DashboardMetricCardProps) {
    const theme = useTheme();

    return (
        <Card sx={dashboardCardSx(theme)}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 188 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}
                    >
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(accentColor, 0.12),
                            color: accentColor,
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    {children}
                </Box>
            </CardContent>
        </Card>
    );
}
