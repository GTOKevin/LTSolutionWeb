import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { tableHeaderSx } from './ProfileShared.helpers';

export function SectionTitle({
    icon,
    title,
    titleColor,
    sx,
}: {
    icon: ReactNode;
    title: string;
    titleColor?: string;
    sx?: object;
}) {
    return (
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2, ...sx }}>
            {icon}
            <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: titleColor }}>
                {title}
            </Typography>
        </Stack>
    );
}

export function MetaLine({ icon, text }: { icon: ReactNode; text: string }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            {icon}
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {text}
            </Typography>
        </Stack>
    );
}

export function TripStat({ label, value }: { label: string; value: string }) {
    return (
        <Box>
            <Typography sx={tableHeaderSx}>{label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 0.25 }}>
                {value}
            </Typography>
        </Box>
    );
}

export function Field({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
    return (
        <Box>
            <Typography
                sx={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    mb: compact ? 0.5 : 0.75,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontSize: compact ? 13 : 15,
                    fontWeight: compact ? 600 : 700,
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

