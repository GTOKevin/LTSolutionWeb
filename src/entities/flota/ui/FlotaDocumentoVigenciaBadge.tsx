import { Chip, alpha, useTheme } from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Alarm as AlarmIcon,
    ErrorOutline as ErrorOutlineIcon,
    HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { getFlotaDocumentoVigenciaVisual } from '../lib/documento-vigencia';

interface FlotaDocumentoVigenciaBadgeProps {
    fechaVencimiento?: string | null;
}

/** Semáforo de vigencia reutilizable (listado y expediente). */
export function FlotaDocumentoVigenciaBadge({ fechaVencimiento }: FlotaDocumentoVigenciaBadgeProps) {
    const theme = useTheme();
    const visual = getFlotaDocumentoVigenciaVisual(fechaVencimiento);

    let baseColor = theme.palette.text.secondary;
    if (visual.tone !== 'default') {
        baseColor = theme.palette[visual.tone].main;
    }

    const Icon =
        visual.key === 'vencido'
            ? ErrorOutlineIcon
            : visual.key === 'por_vencer'
                ? AlarmIcon
                : visual.key === 'desconocido'
                    ? HelpOutlineIcon
                    : CheckCircleIcon;

    return (
        <Chip
            icon={<Icon sx={{ fontSize: '14px !important' }} />}
            label={visual.label}
            size="small"
            sx={{
                bgcolor: alpha(baseColor, 0.14),
                color: baseColor,
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                borderRadius: 999,
                '& .MuiChip-icon': { color: 'inherit' },
            }}
        />
    );
}
