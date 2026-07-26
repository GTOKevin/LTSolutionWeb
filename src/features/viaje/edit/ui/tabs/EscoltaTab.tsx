import { Box, Grid } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { LegacyEscoltasForm, LegacyEscoltasList } from '@features/viaje/legacy';

interface EscoltaTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function EscoltaTab({ viaje, isViewOnly }: EscoltaTabProps) {
    return (
        <Box>
            <Grid container spacing={3}>
                {!isViewOnly && (
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <LegacyEscoltasForm viajeId={viaje.viajeID} />
                    </Grid>
                )}
                <Grid size={{ xs: 12, lg: isViewOnly ? 12 : 8 }}>
                    <LegacyEscoltasList viajeId={viaje.viajeID} isViewOnly={isViewOnly} />
                </Grid>
            </Grid>
        </Box>
    );
}
