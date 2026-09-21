import { Chip, Stack, Typography } from '@mui/material';
import type { FacturaDetalle } from '@/entities/factura/model/types';
import { getFacturaDetalleConceptoLabel, isSobrestadiaDetalle } from '@/entities/factura/model/detalle';

interface FacturaDetalleConceptoCellProps {
    detalle: FacturaDetalle;
}


export function FacturaDetalleConceptoCell({ detalle }: FacturaDetalleConceptoCellProps) {
    if (isSobrestadiaDetalle(detalle)) {
        return (
            <Stack spacing={0.25} sx={{ alignItems: 'flex-start' }}>
                <Chip label={getFacturaDetalleConceptoLabel(detalle)} size="small" color="warning" variant="outlined" sx={{ fontWeight: 700 }} />
                <Typography variant="caption" color="text.secondary">
                    {detalle.flotaPlaca || 'Sin unidad'}
                </Typography>
            </Stack>
        );
    }

    return (
        <Typography variant="body2" fontWeight={600}>
            {detalle.codigo || '-'}
        </Typography>
    );
}
