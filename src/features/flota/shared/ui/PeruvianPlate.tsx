import { Box, Typography } from '@mui/material';
import {
    PERUVIAN_PLATE_SIZE_CONFIG,
    peruvianPlatePernoSx,
    peruvianPlatePeruTextSx,
    peruvianPlateStripSx,
    peruvianPlateSurfaceSx,
    peruvianPlateValueSx,
    type PeruvianPlateSize,
} from './peruvianPlate.styles';

interface PeruvianPlateProps {
    placa?: string | null;
    size?: PeruvianPlateSize;
}

export function PeruvianPlate({ placa, size = 'md' }: PeruvianPlateProps) {
    const formattedPlaca = placa?.trim().toUpperCase() || '— — —';
    const config = PERUVIAN_PLATE_SIZE_CONFIG[size];

    return (
        <Box sx={peruvianPlateSurfaceSx(size)}>
            {/* Fila superior: Perno izquierdo, texto PERÚ, Perno derecho */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    lineHeight: 1,
                }}
            >
                <Box sx={peruvianPlatePernoSx(config.dotSize)} />
                <Typography component="span" sx={peruvianPlatePeruTextSx(config.peruFontSize)}>
                    PERÚ
                </Typography>
                <Box sx={peruvianPlatePernoSx(config.dotSize)} />
            </Box>

            {/* Matrícula central en fuente monoespaciada en relieve */}
            <Typography component="div" sx={{ ...peruvianPlateValueSx(config.plateFontSize), my: 'auto' }}>
                {formattedPlaca}
            </Typography>

            {/* Franja reflectiva inferior amarilla oficial */}
            <Box sx={peruvianPlateStripSx(config.bandHeight)} />
        </Box>
    );
}
