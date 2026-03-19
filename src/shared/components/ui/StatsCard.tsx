import { Box, Card, CardContent, Typography, useTheme, alpha } from '@mui/material';

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
                    <Typography variant="caption" color="text.secondary">
                        {trend > 0 ? 'este mes' : 'esta semana'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
