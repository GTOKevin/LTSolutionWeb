import { Box, Typography } from '@mui/material';
import {
    resolveEmployeeViajeToneColors,
    type EmployeeViajeTone,
} from '../../model/view-helpers';

interface OperationalStatusBadgeProps {
    label: string;
    tone?: EmployeeViajeTone;
}

export function OperationalStatusBadge({
    label,
    tone = 'neutral',
}: OperationalStatusBadgeProps) {
    const colors = resolveEmployeeViajeToneColors(tone);

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: '999px',
                bgcolor: colors.bg,
                color: colors.text,
                border: '1px solid',
                borderColor: colors.border,
            }}
        >
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.border,
                }}
            />
            <Typography
                variant="caption"
                fontWeight={800}
                sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
                {label}
            </Typography>
        </Box>
    );
}
