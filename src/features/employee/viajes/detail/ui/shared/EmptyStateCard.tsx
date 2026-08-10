import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { employeeViajeDetailStyles } from '../../model/view-helpers';

interface EmptyStateCardProps {
    title: string;
    description: string;
    icon?: ReactNode;
}

export function EmptyStateCard({
    title,
    description,
    icon,
}: EmptyStateCardProps) {
    return (
        <Box
            sx={{
                ...employeeViajeDetailStyles.softPanel,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                py: 4,
            }}
        >
            {icon ? (
                <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </Box>
            ) : null}
            <Typography variant="subtitle2" fontWeight={800}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
                {description}
            </Typography>
        </Box>
    );
}
