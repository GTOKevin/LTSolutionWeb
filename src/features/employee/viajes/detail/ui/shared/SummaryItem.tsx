import { Box, Typography } from '@mui/material';

interface SummaryItemProps {
    label: string;
    value: string;
}

export function SummaryItem({ label, value }: SummaryItemProps) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
                {value}
            </Typography>
        </Box>
    );
}
