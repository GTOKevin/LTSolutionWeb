import { Box, Chip, alpha, useTheme, keyframes } from '@mui/material';
import { ESTADO_OPERATIVO_META, ESTADO_OPERATIVO_META_DEFAULT } from '../model/constants';
import type { FlotaEstadoOperativo } from '../model/types';

interface FlotaEstadoOperativoChipProps {
    estado?: FlotaEstadoOperativo;
    active?: boolean;
}

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 196, 130, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(0, 196, 130, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 196, 130, 0);
  }
`;

const warningPulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
  }
`;

export function FlotaEstadoOperativoChip({ estado, active = true }: FlotaEstadoOperativoChipProps) {
    const theme = useTheme();
    const meta = estado
        ? ESTADO_OPERATIVO_META[estado] ?? ESTADO_OPERATIVO_META_DEFAULT
        : active
            ? ESTADO_OPERATIVO_META.DISPONIBLE
            : ESTADO_OPERATIVO_META.INACTIVO;

    const baseColor = meta.color === 'default' ? theme.palette.text.secondary : theme.palette[meta.color].main;
    const isAvailable = estado === 'DISPONIBLE' || (!estado && active);
    const isInRoute = estado === 'EN_VIAJE';

    const pulseAnimation = isInRoute ? `${warningPulse} 2s infinite` : isAvailable ? `${pulse} 2s infinite` : 'none';

    return (
        <Chip
            icon={(
                <Box
                    sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: baseColor,
                        ml: 1,
                        mr: -0.5,
                        animation: pulseAnimation,
                    }}
                />
            )}
            label={meta.label}
            size="small"
            sx={{
                bgcolor: alpha(baseColor, 0.12),
                color: baseColor,
                border: '1px solid',
                borderColor: alpha(baseColor, 0.3),
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                '& .MuiChip-icon': {
                    ml: 0.5,
                },
            }}
        />
    );
}
