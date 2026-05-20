import { Box, Grid } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { EscoltasForm } from './EscoltasForm';
import { EscoltasList } from './EscoltasList';

interface EscoltaTabProps {
    viaje: Viaje;
}

export function EscoltaTab({ viaje }: EscoltaTabProps) {
    return (
        <Box>
            <Grid container spacing={3}>
                <Grid size={{xs:12,lg:4}}>
                    <EscoltasForm viajeId={viaje.viajeID} />
                </Grid>
                <Grid size={{xs:12,lg:8}}>
                    <EscoltasList viajeId={viaje.viajeID} />
                </Grid>
            </Grid>
        </Box>
    );
}
