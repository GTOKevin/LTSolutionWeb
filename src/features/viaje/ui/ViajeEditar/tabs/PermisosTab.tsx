import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import type { Viaje } from '@/entities/viaje/model/types';

interface PermisosTabProps {
    viaje: Viaje;
}

export function PermisosTab({ viaje }: PermisosTabProps) {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Gestión de Permisos Especiales</Typography>
                <Button variant="contained" startIcon={<AddModeratorIcon />} size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Solicitar Permiso
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
                <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        No hay permisos especiales
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Gestiona permisos MTC, SUTRAN u otros requeridos para la carga.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
