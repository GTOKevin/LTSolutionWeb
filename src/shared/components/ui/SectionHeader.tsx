import { Box, Typography, alpha } from '@mui/material';

interface SectionHeaderProps {
    number: string;
    title: string;
    themeColor: string;
}

export const SectionHeader = ({ number, title, themeColor }: SectionHeaderProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: alpha(themeColor, 0.1),
            color: themeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
        }}>
            {number}
        </Box>
        <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {title}
        </Typography>
    </Box>
);
