import { Chip, useTheme, alpha } from '@mui/material';

interface StatusChipProps {
    active: boolean;
}

export function StatusChip({ active }: StatusChipProps) {
    const theme = useTheme();

    return (
        <Chip
            label={active ? 'Activo' : 'Inactivo'}
            size="small"
            sx={{
                bgcolor: active 
                    ? alpha(theme.palette.success.main, 0.1) 
                    : alpha(theme.palette.error.main, 0.1),
                color: active 
                    ? theme.palette.success.dark 
                    : theme.palette.error.dark,
                border: '1px solid',
                borderColor: active 
                    ? alpha(theme.palette.success.main, 0.2) 
                    : alpha(theme.palette.error.main, 0.2),
                fontWeight: 600
            }}
        />
    );
}
