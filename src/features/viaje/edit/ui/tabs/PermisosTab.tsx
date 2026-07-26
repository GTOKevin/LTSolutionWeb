import { Box, Grid } from '@mui/material';
import type { Viaje } from '@/entities/viaje/model/types';
import { LegacyPermisosForm, LegacyPermisosList } from './legacy/LegacyPermisosTab';

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
                        <LegacyPermisosForm viajeId={viaje.viajeID} />
                    </Grid>
                )}
                <Grid size={{ xs: 12, lg: isViewOnly ? 12 : 8.5 }}>
                    <LegacyPermisosList viajeId={viaje.viajeID} isViewOnly={isViewOnly} />
                </Grid>
            </Grid>
        </Box>
    );
}
