import { Chip, alpha, useTheme } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export interface FacturadoChipProps {
    facturaNumero?: string | null;
    withIcon?: boolean;
    maxWidth?: number | string;
    size?: 'sm' | 'md';
}


export function FacturadoChip({
    facturaNumero,
    withIcon = false,
    maxWidth,
    size = 'sm',
}: FacturadoChipProps) {
    const theme = useTheme();
    const isMd = size === 'md';

    return (
        <Chip
            icon={withIcon ? <ReceiptLongIcon sx={{ fontSize: 13 }} /> : undefined}
            label={facturaNumero ? `Facturado · ${facturaNumero}` : 'Facturado'}
            size="small"
            sx={{
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.dark,
                border: `1px solid ${alpha(theme.palette.success.main, isMd ? 0.25 : 0.2)}`,
                fontWeight: 700,
                fontSize: '0.65rem',
                height: isMd ? 24 : 20,
                maxWidth: maxWidth ?? '100%',
                '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    ...(isMd ? { px: 0.75 } : null),
                },
            }}
        />
    );
}