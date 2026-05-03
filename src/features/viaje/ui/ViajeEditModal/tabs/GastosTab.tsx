import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import AddCardIcon from '@mui/icons-material/AddCard';
import type { Viaje } from '@/entities/viaje/model/types';

interface GastosTabProps {
    viaje: Viaje;
}

export function GastosTab({ viaje }: GastosTabProps) {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Registro de Gastos de Viaje</Typography>
                <Button variant="contained" startIcon={<AddCardIcon />} size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Añadir Gasto
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
                <PaidIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        Sin gastos registrados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Registra peajes, viáticos, combustible y otros gastos del viaje.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
