import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import type { Viaje } from '@/entities/viaje/model/types';

interface PlanificacionRutaTabProps {
    viaje: Viaje;
}

export function PlanificacionRutaTab({ viaje }: PlanificacionRutaTabProps) {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Planificación de Paradas y Ruta</Typography>
                <Button variant="contained" startIcon={<AddLocationAltIcon />} size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Agregar Parada
                </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Paper 
                variant="outlined" 
                sx={{ 
                    p: 6, 
                    textAlign: 'center', 
                    bgcolor: 'background.default',
                    borderStyle: 'dashed',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                <MapIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        No hay paradas planificadas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Agrega puntos de parada y diseña la ruta para este viaje.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
