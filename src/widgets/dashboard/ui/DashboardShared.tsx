import { Box, Stack, Typography, useTheme } from '@mui/material';
import {
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { formatTrendPercentage, getTrendDirection } from '@features/dashboard/lib/dashboard-helpers';

export function TrendBadge({ value, compact = false }: { value: number; compact?: boolean }) {
    const theme = useTheme();
    const direction = getTrendDirection(value);

    const icon = direction === 'up'
        ? <TrendingUpIcon sx={{ fontSize: compact ? 14 : 16 }} />
        : direction === 'down'
            ? <TrendingDownIcon sx={{ fontSize: compact ? 14 : 16 }} />
            : <TrendingFlatIcon sx={{ fontSize: compact ? 14 : 16 }} />;

    const color = direction === 'up'
        ? theme.palette.success.main
        : direction === 'down'
            ? theme.palette.error.main
            : theme.palette.text.secondary;

    return (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color, mt: compact ? 0 : 0.5 }}>
            {icon}
            <Typography variant="caption" fontWeight={700} sx={{ color }}>
                {formatTrendPercentage(value)}
            </Typography>
        </Stack>
    );
}

export function FacturacionLegendItem({
    color,
    label,
    percentage,
    count,
}: {
    color: string;
    label: string;
    percentage: number;
    count: number;
}) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700}>
                {percentage.toFixed(1)}% · {count}
            </Typography>
        </Box>
    );
}
