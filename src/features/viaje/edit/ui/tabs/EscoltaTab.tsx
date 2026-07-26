import { Box, Grid } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { EscoltasForm } from '@features/viaje/ui/ViajeEditar/EscoltaTab/EscoltasForm';
import { EscoltasList } from '@features/viaje/ui/ViajeEditar/EscoltaTab/EscoltasList';

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
                        <EscoltasForm viajeId={viaje.viajeID} />
                    </Grid>
                )}
                <Grid size={{ xs: 12, lg: isViewOnly ? 12 : 8 }}>
                    <EscoltasList viajeId={viaje.viajeID} isViewOnly={isViewOnly} />
                </Grid>
            </Grid>
        </Box>
    );
}
