import { Chip, alpha, useTheme } from '@mui/material';
import { ESTADO_OPERATIVO_META, ESTADO_OPERATIVO_META_DEFAULT } from '../model/constants';
import type { FlotaEstadoOperativo } from '../model/types';

interface FlotaEstadoOperativoChipProps {
    estado?: FlotaEstadoOperativo;
    active?: boolean;
}

/**
 * Chip del estado operativo derivado (DISPONIBLE / EN_VIAJE / EN_MANTENIMIENTO / INACTIVO).
 * Si no llega el derivado, degrada a Activo/Inactivo con el campo `active`.
 */
export function FlotaEstadoOperativoChip({ estado, active = true }: FlotaEstadoOperativoChipProps) {
    const theme = useTheme();
    const meta = estado
        ? ESTADO_OPERATIVO_META[estado] ?? ESTADO_OPERATIVO_META_DEFAULT
        : active
            ? ESTADO_OPERATIVO_META.DISPONIBLE
            : ESTADO_OPERATIVO_META.INACTIVO;

    const baseColor = meta.color === 'default' ? theme.palette.text.secondary : theme.palette[meta.color].main;

    return (
        <Chip
            label={meta.label}
            size="small"
            sx={{
                bgcolor: alpha(baseColor, 0.12),
                color: baseColor,
                border: '1px solid',
                borderColor: alpha(baseColor, 0.25),
                fontWeight: 600,
            }}
        />
    );
}
