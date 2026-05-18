import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import type { Viaje } from '@/entities/viaje/model/types';

interface EscoltaTabProps {
    viaje: Viaje;
}

export function EscoltaTab({ viaje }: EscoltaTabProps) {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Asignación de Escolta</Typography>
                <Button variant="contained" startIcon={<LocalPoliceIcon />} size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Asignar Vehículo
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
                <SecurityIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        Sin escolta asignada
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        El viaje requiere escolta pero no se han asignado vehículos o personal.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
