import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface PaperCardProps {
    children: ReactNode;
}

export function PaperCard({ children }: PaperCardProps) {
    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}
        >
            {children}
        </Box>
    );
}
