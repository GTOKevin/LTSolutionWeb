import { Box, Grid } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { PermisosForm } from './PermisosForm';
import { PermisosList } from './PermisosList';

interface PermisosTabProps {
    viaje: Viaje;
}

export function PermisosTab({ viaje }: PermisosTabProps) {
    return (
        <Box>
            <Grid container spacing={3}>
                <Grid size={{xs:12,lg:3.5}}>
                    <PermisosForm viajeId={viaje.viajeID} />
                </Grid>
                <Grid size={{xs:12,lg:8.5}}>
                    <PermisosList viajeId={viaje.viajeID} />
                </Grid>
            </Grid>
        </Box>
    );
}
