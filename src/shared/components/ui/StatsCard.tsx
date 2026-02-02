import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: number;
    color: string;
}

export function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
    const theme = useTheme();
    
    return (
        <Card sx={{ 
            height: '100%', 
            borderRadius: 3, 
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            bgcolor: theme.palette.background.paper
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        {title}
                    </Typography>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex'
                    }}>
                        {icon}
                    </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    {value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {trend > 0 ? (
                        <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />
                    ) : (
                        <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />
                    )}
                    <Typography variant="caption" fontWeight="bold" color={trend > 0 ? 'success.main' : 'error.main'}>
                        {Math.abs(trend)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {trend > 0 ? 'este mes' : 'esta semana'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
