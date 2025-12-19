import { Chip, useTheme, alpha } from '@mui/material';

interface StatusChipProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export function StatusChip({ active, activeLabel = 'Habilitado', inactiveLabel = 'Inactivo' }: StatusChipProps) {
    const theme = useTheme();
    return (
        <Chip
            label={active ? activeLabel : inactiveLabel}
            size="small"
            sx={{
                height: 24,
                bgcolor: active
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.error.main, 0.1),
                color: active
                    ? theme.palette.success.dark
                    : theme.palette.error.dark,
                fontWeight: 600,
                fontSize: '0.75rem'
            }}
        />
    );
}
