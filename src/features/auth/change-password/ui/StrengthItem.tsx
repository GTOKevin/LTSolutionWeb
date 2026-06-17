import { Box, Typography } from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as CircleIcon,
} from '@mui/icons-material';

interface StrengthItemProps {
    label: string;
    checked: boolean;
}

export function StrengthItem({ label, checked }: StrengthItemProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {checked ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
                <CircleIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            )}
            <Typography variant="caption" color={checked ? 'text.primary' : 'text.disabled'}>
                {label}
            </Typography>
        </Box>
    );
}
