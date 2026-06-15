import { Box, Skeleton } from '@mui/material';

export function DashboardOverviewSkeleton() {
    return (
        <Box sx={{ p: { xs: 2, md: 3 }, display: 'grid', gap: 2 }}>
            <Skeleton variant="rounded" height={82} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={188} />
                ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' }, gap: 2 }}>
                <Skeleton variant="rounded" height={360} />
                <Skeleton variant="rounded" height={360} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '2fr 1fr' }, gap: 2 }}>
                <Skeleton variant="rounded" height={380} />
                <Box sx={{ display: 'grid', gap: 2 }}>
                    <Skeleton variant="rounded" height={220} />
                    <Skeleton variant="rounded" height={180} />
                </Box>
            </Box>
        </Box>
    );
}
