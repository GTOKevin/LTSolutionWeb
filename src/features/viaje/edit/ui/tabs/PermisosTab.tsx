import { Box, Grid } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { PermisosForm, PermisosList } from './legacy/LegacyPermisos';

interface PermisosTabProps {
    viaje: Viaje;
    isViewOnly?: boolean;
}

export function PermisosTab({ viaje, isViewOnly }: PermisosTabProps) {
    return (
        <Box>
            <Grid container spacing={3}>
                {!isViewOnly && (
                    <Grid size={{ xs: 12, lg: 3.5 }}>
                        <PermisosForm viajeId={viaje.viajeID} />
                    </Grid>
                )}
                <Grid size={{ xs: 12, lg: isViewOnly ? 12 : 8.5 }}>
                    <PermisosList viajeId={viaje.viajeID} isViewOnly={isViewOnly} />
                </Grid>
            </Grid>
        </Box>
    );
}
