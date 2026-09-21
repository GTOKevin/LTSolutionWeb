import { Box, Typography, alpha, useTheme } from '@mui/material';

interface FacturaDetalleSectionHeaderProps {
    index: number;
    title: string;
}


export function FacturaDetalleSectionHeader({ index, title }: FacturaDetalleSectionHeaderProps) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pb: 1.25, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {index}
            </Box>
            <Typography variant="caption" fontWeight={800} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Typography>
        </Box>
    );
}
