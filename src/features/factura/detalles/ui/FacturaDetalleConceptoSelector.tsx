import { type ReactNode } from 'react';
import { Box, Button, Typography, alpha, useTheme } from '@mui/material';
import {
    LocalShipping as LocalShippingIcon,
    Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { TIPO_DETALLE_CODES, type TipoDetalleCodigo } from '@entities/factura/model/constants';

interface FacturaDetalleConceptoSelectorProps {
    value: TipoDetalleCodigo;
    onChange: (next: TipoDetalleCodigo) => void;
    getLabel: (codigo: TipoDetalleCodigo) => string;
}

export function FacturaDetalleConceptoSelector({ value, onChange, getLabel }: FacturaDetalleConceptoSelectorProps) {
    const theme = useTheme();

    const renderOption = (codigo: TipoDetalleCodigo, icon: ReactNode) => {
        const isActive = value === codigo;

        return (
            <Button
                type="button"
                onClick={() => onChange(codigo)}
                startIcon={icon}
                sx={{
                    py: 1.25,
                    borderRadius: 2,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive ? 'background.paper' : 'transparent',
                    boxShadow: isActive ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                    border: 1,
                    borderColor: isActive ? alpha(theme.palette.primary.main, 0.25) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        bgcolor: isActive ? 'background.paper' : 'action.hover',
                    }
                }}
            >
                {getLabel(codigo)}
            </Button>
        );
    };

    return (
        <Box component="section">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                    Sección A • Tipo de Concepto
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    Selecciona la naturaleza del ítem
                </Typography>
            </Box>
            <Box sx={{
                p: 0.75,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
            }}>
                {renderOption(TIPO_DETALLE_CODES.FLETE, <LocalShippingIcon fontSize="small" />)}
                {renderOption(TIPO_DETALLE_CODES.SOBRESTADIA, <ScheduleIcon fontSize="small" />)}
            </Box>
        </Box>
    );
}
