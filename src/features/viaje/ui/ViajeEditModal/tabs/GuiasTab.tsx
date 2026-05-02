import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PostAddIcon from '@mui/icons-material/PostAdd';
import type { Viaje } from '@/entities/viaje/model/types';

interface GuiasTabProps {
    viaje: Viaje;
}

export function GuiasTab({ viaje }: GuiasTabProps) {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">Gestión de Guías de Remisión</Typography>
                <Button variant="contained" startIcon={<PostAddIcon />} size="small" sx={{ borderRadius: 2, textTransform: 'none' }}>
                    Nueva Guía
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
                <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                        Sin guías registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Aún no se han adjuntado guías de remisión para este viaje.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
