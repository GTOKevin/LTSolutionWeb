import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface DetailSectionHeaderProps {
    eyebrow?: string;
    title: string;
    description?: string;
    aside?: ReactNode;
}

export function DetailSectionHeader({
    eyebrow,
    title,
    description,
    aside,
}: DetailSectionHeaderProps) {
    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-start' }}
            spacing={2}
            sx={{ mb: 3 }}
        >
            <Box>
                {eyebrow ? (
                    <Typography
                        variant="caption"
                        fontWeight={800}
                        color="text.secondary"
                        sx={{ letterSpacing: '0.1em', display: 'block', mb: 1, textTransform: 'uppercase' }}
                    >
                        {eyebrow}
                    </Typography>
                ) : null}
                <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ mb: description ? 0.75 : 0 }}>
                    {title}
                </Typography>
                {description ? (
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                ) : null}
            </Box>
            {aside ? <Box sx={{ flexShrink: 0 }}>{aside}</Box> : null}
        </Stack>
    );
}
