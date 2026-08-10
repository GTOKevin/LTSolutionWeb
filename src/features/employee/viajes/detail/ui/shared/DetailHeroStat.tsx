import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { employeeViajeDetailStyles } from '../../model/view-helpers';

interface DetailHeroStatProps {
    label: string;
    value: string;
    helper?: string;
    icon?: ReactNode;
}

export function DetailHeroStat({
    label,
    value,
    helper,
    icon,
}: DetailHeroStatProps) {
    return (
        <Box sx={employeeViajeDetailStyles.heroStat}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 0.75 }}
                    >
                        {label}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                    {helper ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                            {helper}
                        </Typography>
                    ) : null}
                </Box>
                {icon ? (
                    <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                        {icon}
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
}
